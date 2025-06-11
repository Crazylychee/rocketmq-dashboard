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
package org.apache.rocketmq.dashboard.service.impl;

import com.google.common.collect.Maps;
import java.util.List;
import java.util.Map;
import jakarta.annotation.Resource;
import org.apache.rocketmq.dashboard.admin.MyRocketMQAdminService;
import org.apache.rocketmq.dashboard.admin.UserMQAdminPoolManager;
import org.apache.rocketmq.dashboard.config.RMQConfigure;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.dashboard.service.AbstractCommonService;
import org.apache.rocketmq.dashboard.service.OpsService;
import org.apache.rocketmq.dashboard.service.checker.CheckerType;
import org.apache.rocketmq.dashboard.service.checker.RocketMqChecker;
import org.apache.rocketmq.dashboard.service.client.MQAdminInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// Assuming Maps is from Guava
import lombok.extern.slf4j.Slf4j;
// 引入 MQAdminExt

@Slf4j
@Service
public class OpsServiceImpl extends AbstractCommonService implements OpsService {

    @Resource
    private RMQConfigure configure;

    // 注入我们新的用户隔离连接池管理器，用于在全局配置变更时清空所有池
    @Autowired
    private UserMQAdminPoolManager userMQAdminPoolManager;

    // 注入我们封装的 RocketMQ Admin 服务，用于执行系统级检查
    @Autowired
    private MyRocketMQAdminService myRocketMQAdminService;

    @Resource
    private List<RocketMqChecker> rocketMqCheckerList;

    // 移除了对 GenericObjectPool<MQAdminExt> mqAdminExtPool 的 @Autowired

    @Override
    public Map<String, Object> homePageInfo() {
        Map<String, Object> homePageInfoMap = Maps.newHashMap();
        homePageInfoMap.put("currentNamesrv", configure.getNamesrvAddr());
        // 假设 configure.getNamesrvAddrs() 存在并返回 List<String>
        homePageInfoMap.put("namesvrAddrList", configure.getNamesrvAddrs());
        homePageInfoMap.put("useVIPChannel", Boolean.valueOf(configure.getIsVIPChannel()));
        homePageInfoMap.put("useTLS", configure.isUseTLS());
        return homePageInfoMap;
    }

    @Override
    public void updateNameSvrAddrList(String nameSvrAddrList) {
        configure.setNamesrvAddr(nameSvrAddrList);
        // 当 Nameserver 地址更新时，需要清空所有用户专属的 MQAdminExt 连接池
        // 这样，下次用户借用对象时，新的 MQAdminExt 实例会使用到新的 Nameserver 地址。
        userMQAdminPoolManager.shutdownAllPools();
        log.info("NameServer address updated to {}, all MQAdminExt user pools cleared.", nameSvrAddrList);
    }

    @Override
    public String getNameSvrList() {
        return configure.getNamesrvAddr();
    }

    @Override
    public Map<CheckerType, Object> rocketMqStatusCheck() {
        Map<CheckerType, Object> checkResultMap = Maps.newHashMap();

        // 核心修改：RocketMqChecker 的 doCheck() 方法可能需要 MQAdminExt 实例。
        // 由于这些检查是系统级的，不属于任何特定用户，我们可以使用一个默认的“系统用户”来执行。
        // 或者，更好的方法是提供一个专门的 `executeSystemAdminOperation` 方法在 MyRocketMQAdminService 中。
        // 这里我们假设存在一个 SystemUser，或者您定义了一个不需要 ACL 认证的默认 MQAdminExt 实例。

        // 方案一：为检查器提供一个默认的、无 ACL 的 MQAdminExt 实例（如果允许）。
        // 可以在 UserMQAdminPoolManager 中增加一个 getSystemMQAdminExt() 方法，
        // 或者在 MyRocketMQAdminService 中提供一个通用的执行方法。
        //
        // 为了保持 MyRocketMQAdminService 的接口一致性，我们模拟一个“系统用户”来调用。
        // ！！注意：这个系统用户需要确保其 AccessKey/SecretKey 在您的认证系统中是有效且具有足够权限的。
        // 如果您的 RocketMQ 集群不需要 ACL 认证，则 AccessKey 和 SecretKey 可以为空字符串。
        User systemUser = new User("rocketmq32", "1234567", 0); // 假设0代表系统用户类型

        for (RocketMqChecker rocketMqChecker : rocketMqCheckerList) {
            try {
                // 通过 MyRocketMQAdminService 的 executeAdminOperation 方法执行检查
                // 这样借用和归还 MQAdminExt 的逻辑就被封装了
                Object checkResult = myRocketMQAdminService.executeAdminOperation(systemUser, mqAdminExt -> {
                    // 临时设置 ThreadLocal 里的 MQAdminExt，供 doCheck 内部使用（如果 doCheck 依赖 ThreadLocal）
                    // 这一步是如果 RocketMqChecker.doCheck() 内部也像 MQAdminExtImpl 一样依赖 MQAdminInstance.threadLocalMQAdminExt()
                    MQAdminInstance.setCurrentMQAdminExt(mqAdminExt);
                    try {
                        return rocketMqChecker.doCheck();
                    } finally {
                        MQAdminInstance.clearCurrentMQAdminExt(); // 确保清理
                    }
                });
                checkResultMap.put(rocketMqChecker.checkerType(), checkResult);
            } catch (Exception e) {
                log.error("RocketMQ status check failed for checker type {}: {}", rocketMqChecker.checkerType(), e.getMessage(), e);
                checkResultMap.put(rocketMqChecker.checkerType(), "Check Failed: " + e.getMessage());
            }
        }
        return checkResultMap;
    }

    @Override
    public boolean updateIsVIPChannel(String useVIPChannel) {
        configure.setIsVIPChannel(useVIPChannel);
        // VIP Channel 配置变更，清空所有用户池
        userMQAdminPoolManager.shutdownAllPools();
        log.info("VIP Channel setting updated to {}, all MQAdminExt user pools cleared.", useVIPChannel);
        return true;
    }

    @Override
    public boolean updateUseTLS(boolean useTLS) {
        configure.setUseTLS(useTLS);
        // TLS 配置变更，清空所有用户池
        userMQAdminPoolManager.shutdownAllPools();
        log.info("TLS setting updated to {}, all MQAdminExt user pools cleared.", useTLS);
        return true;
    }

    @Override
    public void addNameSvrAddr(String namesrvAddr) {
        List<String> namesrvAddrs = configure.getNamesrvAddrs();
        if (namesrvAddrs != null && !namesrvAddrs.contains(namesrvAddr)) {
            namesrvAddrs.add(namesrvAddr);
        }
        configure.setNamesrvAddrs(namesrvAddrs);
        // 添加 Nameserver 地址也应该触发所有池的清理，确保新连接使用更新后的列表
        userMQAdminPoolManager.shutdownAllPools();
        log.info("Added NameServer address {}, all MQAdminExt user pools cleared.", namesrvAddr);
    }
}
