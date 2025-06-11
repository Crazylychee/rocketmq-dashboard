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

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.rocketmq.remoting.protocol.body.ClusterInfo;
import org.apache.rocketmq.tools.admin.MQAdminExt;

import org.apache.rocketmq.client.ClientConfig;
import org.apache.rocketmq.acl.common.AclClientRPCHook;
import org.apache.rocketmq.acl.common.SessionCredentials;
import org.apache.rocketmq.remoting.RPCHook;
import org.apache.rocketmq.tools.admin.DefaultMQAdminExt;
import org.apache.commons.lang3.StringUtils; // 引入 StringUtils

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 针对特定用户（通过 AccessKey 标识）创建 MQAdminExt 实例的对象工厂。
 * 确保每个用户的 MQAdminExt 实例都基于一个唯一的 ClientConfig (特别是 instanceName)，
 * 从而实现底层 MQClientInstance 的隔离。
 */
@Slf4j
public class UserSpecificMQAdminPooledObjectFactory implements PooledObjectFactory<MQAdminExt> {

    // 这个 ClientConfig 是为当前用户（由 userAk 标识）的 MQAdminExt 实例准备的。
    // 它的 instanceName 包含 userAk，确保了底层 MQClientInstance 的唯一性。
    private final ClientConfig userSpecificClientConfig;
    private final RPCHook rpcHook;
    private final String userAk; // 用于日志记录和识别
    // 实例创建计数器，用于在 instanceName 中增加一些额外随机性，如果 MaxTotal > 1
    private final AtomicLong instanceCreationCounter = new AtomicLong(0);

    /**
     * 构造函数。
     *
     * @param baseClientConfig 基础客户端配置（例如 NameServer 地址，来自 RMQConfigure）。
     * @param userAk           用户的 Access Key。
     * @param userSk           用户的 Secret Key。
     */
    public UserSpecificMQAdminPooledObjectFactory(ClientConfig baseClientConfig, String userAk, String userSk) {
        // 克隆基础配置，并为当前用户定制
        this.userSpecificClientConfig = baseClientConfig.cloneClientConfig();
        // 这是实现用户隔离的关键：为每个用户的 MQAdminExt 设置一个唯一的 instanceName。
        // RocketMQ 的 MQClientManager 会根据 instanceName 来区分和管理 MQClientInstance。
        this.userSpecificClientConfig.setInstanceName("MQ_ADMIN_INSTANCE_" + userAk + "_" + UUID.randomUUID().toString());

        // 根据用户的 AK/SK 创建 RPC 钩子，用于 ACL 认证
        if (StringUtils.isNotEmpty(userAk) && StringUtils.isNotEmpty(userSk)) {
            this.rpcHook = new AclClientRPCHook(new SessionCredentials(userAk, userSk));
        } else {
            this.rpcHook = null;
        }
        this.userAk = userAk;

        log.info("UserSpecificMQAdminPooledObjectFactory initialized for user: {}", userAk);
        log.debug("Factory ClientConfig for user {}: {}", userAk, userSpecificClientConfig);
    }

    /**
     * 创建一个新的 MQAdminExt 实例。
     * 这个实例将使用构造函数中传入的 userSpecificClientConfig 和 rpcHook。
     */
    @Override
    public PooledObject<MQAdminExt> makeObject() throws Exception {
        // 使用用户特定的 ClientConfig 和 RPCHook 创建 DefaultMQAdminExt 实例。
        // DefaultMQAdminExt 内部会通过 MQClientManager 管理其 MQClientInstance。
        DefaultMQAdminExt mqAdminExt = new DefaultMQAdminExt(rpcHook);

        // 可以选择性地设置 adminExtGroup，用于管理命令的分组，不影响客户端实例隔离。
        mqAdminExt.setAdminExtGroup("MQ_ADMIN_GROUP_FOR_" + userAk + "_" + instanceCreationCounter.getAndIncrement());

        mqAdminExt.start();
        log.info("Created new MQAdminExt instance ({}) for user {}", mqAdminExt, userAk);
        return new DefaultPooledObject<>(mqAdminExt);
    }

    /**
     * 销毁不再需要的 MQAdminExt 实例。
     * 确保调用 shutdown() 方法释放资源。
     */
    @Override
    public void destroyObject(PooledObject<MQAdminExt> p) {
        MQAdminExt mqAdmin = p.getObject();
        if (mqAdmin != null) {
            try {
                mqAdmin.shutdown();
            } catch (Exception e) {
                log.warn("Failed to shut down MQAdminExt object ({}) for user {}: {}", p.getObject(), userAk, e.getMessage(), e);
            }
        }
        log.info("Destroyed MQAdminExt object ({}) for user {}", p.getObject(), userAk);
    }

    /**
     * 验证 MQAdminExt 实例是否有效。
     * 如果实例无效，它将被销毁并可能重新创建。
     */
    @Override
    public boolean validateObject(PooledObject<MQAdminExt> p) {
        MQAdminExt mqAdmin = p.getObject();
        // 检查实例是否为空或未启动
        if (mqAdmin == null) {
            log.warn("MQAdminExt object is null or not started for user {}: {}", userAk, mqAdmin);
            return false;
        }
        try {
            // 通过尝试获取集群信息来验证连接的有效性
            ClusterInfo clusterInfo = mqAdmin.examineBrokerClusterInfo();
            boolean isValid = clusterInfo != null && !clusterInfo.getBrokerAddrTable().isEmpty();
            if (!isValid) {
                log.warn("Validation failed for MQAdminExt object for user {}: ClusterInfo is invalid or empty. ClusterInfo = {}", userAk, clusterInfo);
            }
            return isValid;
        } catch (Exception e) {
            log.warn("Validation error for MQAdminExt object for user {}: {}", userAk, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 激活对象（从池中借出时调用）。
     */
    @Override
    public void activateObject(PooledObject<MQAdminExt> p) {
        log.debug("Activating MQAdminExt object ({}) for user {}", p.getObject(), userAk);
    }

    /**
     * 钝化对象（归还到池中时调用）。
     */
    @Override
    public void passivateObject(PooledObject<MQAdminExt> p) {
        log.debug("Passivating MQAdminExt object ({}) for user {}", p.getObject(), userAk);
    }
}
