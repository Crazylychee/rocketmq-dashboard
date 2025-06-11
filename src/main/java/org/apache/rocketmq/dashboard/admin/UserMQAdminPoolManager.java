/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.rocketmq.dashboard.admin;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.apache.rocketmq.dashboard.config.RMQConfigure;
import org.apache.rocketmq.tools.admin.MQAdminExt;
import org.springframework.beans.factory.annotation.Autowired;

import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.ClientConfig;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy; // 引入 PreDestroy
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 管理所有用户专属的 MQAdminExt 对象池。
 * 每个用户（通过 AccessKey 标识）拥有一个独立的 GenericObjectPool<MQAdminExt>。
 */
@Component // 标记为 Spring Bean
@Slf4j
public class UserMQAdminPoolManager {

    // 存储每个用户 AccessKey 对应的 MQAdminExt 对象池
    private final ConcurrentMap<String/* userAk */, GenericObjectPool<MQAdminExt>> userPools = new ConcurrentHashMap<>();

    // 基础的客户端配置，例如 NameServer 地址，所有用户共享。
    private final ClientConfig baseClientConfig;

    @Autowired
    public UserMQAdminPoolManager(RMQConfigure rmqConfigure) {
        // 从 RMQConfigure 初始化基础 ClientConfig
        this.baseClientConfig = new ClientConfig();
        this.baseClientConfig.setNamesrvAddr(rmqConfigure.getNamesrvAddr());
        this.baseClientConfig.setClientCallbackExecutorThreads(rmqConfigure.getClientCallbackExecutorThreads());
        this.baseClientConfig.setVipChannelEnabled(Boolean.parseBoolean(rmqConfigure.getIsVIPChannel()));
        this.baseClientConfig.setUseTLS(rmqConfigure.isUseTLS());
        log.info("UserMQAdminPoolManager initialized with baseClientConfig for NameServer: {}", rmqConfigure.getNamesrvAddr());
    }

    /**
     * 为指定用户借用一个 MQAdminExt 实例。
     * 如果该用户还没有对象池，则会先创建。
     *
     * @param userAk 用户的 Access Key (作为对象池的唯一标识)。
     * @param userSk 用户的 Secret Key。
     * @return 属于该用户的 MQAdminExt 实例。
     * @throws Exception 如果无法从池中借用对象（例如创建失败或等待超时）。
     */
    public MQAdminExt borrowMQAdminExt(String userAk, String userSk) throws Exception {
        GenericObjectPool<MQAdminExt> userPool = userPools.get(userAk);

        // 如果用户池不存在，则创建新的
        if (userPool == null) {
            log.info("Creating new MQAdminExt pool for user: {}", userAk);
            // 配置对象池
            GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig();
            poolConfig.setMaxTotal(1); // 通常，每个用户一个 MQAdminExt 实例就足够了
            poolConfig.setMaxIdle(1);
            poolConfig.setMinIdle(0);
            poolConfig.setTestWhileIdle(true); // 空闲时验证对象
            poolConfig.setTimeBetweenEvictionRunsMillis(20000); // 20秒运行一次驱逐器
            poolConfig.setMaxWaitMillis(10000); // 最大等待时间10秒

            // 为当前用户创建 UserSpecificMQAdminPooledObjectFactory
            UserSpecificMQAdminPooledObjectFactory factory =
                    new UserSpecificMQAdminPooledObjectFactory(baseClientConfig, userAk, userSk);

            GenericObjectPool<MQAdminExt> newUserPool = new GenericObjectPool<>(factory, poolConfig);

            // 使用 putIfAbsent 确保线程安全地创建池，避免重复创建
            GenericObjectPool<MQAdminExt> existingPool = userPools.putIfAbsent(userAk, newUserPool);
            if (existingPool != null) {
                // 如果在并发情况下其他线程已经创建了，则使用已存在的池，并关闭当前线程创建的多余池
                log.warn("Another thread concurrently created MQAdminExt pool for user {}. Shutting down redundant pool.", userAk);
                newUserPool.close(); // 关闭多余的池及其中的对象
                userPool = existingPool;
            } else {
                userPool = newUserPool;
                log.info("Successfully created and registered MQAdminExt pool for user: {}", userAk);
            }
        }

        // 从用户的专属池中借用 MQAdminExt 实例
        return userPool.borrowObject();
    }

    /**
     * 将 MQAdminExt 实例归还给其用户专属的对象池。
     *
     * @param userAk    用户的 Access Key。
     * @param mqAdminExt 要归还的 MQAdminExt 实例。
     */
    public void returnMQAdminExt(String userAk, MQAdminExt mqAdminExt) {
        GenericObjectPool<MQAdminExt> userPool = userPools.get(userAk);
        if (userPool != null) {
            try {
                userPool.returnObject(mqAdminExt);
                log.debug("Returned MQAdminExt object ({}) to pool for user: {}", mqAdminExt, userAk);
            } catch (Exception e) {
                log.error("Failed to return MQAdminExt object ({}) for user {}: {}", mqAdminExt, userAk, e.getMessage(), e);
                // 如果归还失败（例如池已关闭），则强制关闭该实例以防止资源泄漏
                if (mqAdminExt != null) {
                    try {
                        mqAdminExt.shutdown();
                    } catch (Exception se) {
                        log.warn("Error shutting down MQAdminExt after failed return: {}", se.getMessage());
                    }
                }
            }
        } else {
            log.warn("Attempted to return MQAdminExt for non-existent user pool: {}. Shutting down the object directly.", userAk);
            // 如果池不存在，直接关闭对象
            if (mqAdminExt != null ) {
                try {
                    mqAdminExt.shutdown();
                } catch (Exception se) {
                    log.warn("Error shutting down MQAdminExt for non-existent pool: {}", se.getMessage());
                }
            }
        }
    }

    /**
     * 关闭并移除指定用户的对象池。
     * 这应该在用户会话结束或失效时调用，以释放资源。
     *
     * @param userAk 用户的 Access Key。
     */
    public void shutdownUserPool(String userAk) {
        GenericObjectPool<MQAdminExt> userPool = userPools.remove(userAk);
        if (userPool != null) {
            userPool.close(); // 这将销毁池中的所有对象
            log.info("Shutdown and removed MQAdminExt pool for user: {}", userAk);
        } else {
            log.warn("Attempted to shut down non-existent user pool: {}", userAk);
        }
    }

    /**
     * 在应用程序关闭时，优雅地关闭所有活跃的用户对象池。
     */
    @PreDestroy // Spring 容器销毁前调用此方法
    public void shutdownAllPools() {
        log.info("Shutting down all MQAdminExt user pools...");
        userPools.forEach((userAk, pool) -> {
            pool.close(); // 关闭每个池
            log.info("Shutdown MQAdminExt pool for user: {}", userAk);
        });
        userPools.clear(); // 清空 Map
        log.info("All MQAdminExt user pools have been shut down.");
    }
}
