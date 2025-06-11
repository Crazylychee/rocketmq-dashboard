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

//package org.apache.rocketmq.dashboard.admin;
//
//import lombok.extern.slf4j.Slf4j;
//import org.apache.rocketmq.auth.authentication.enums.UserType;
//import org.apache.rocketmq.dashboard.config.RMQConfigure;
//import org.apache.rocketmq.dashboard.model.User;
//import org.apache.rocketmq.dashboard.service.AclService;
//import org.apache.rocketmq.dashboard.service.provider.UserInfoProvider;
//import org.apache.rocketmq.dashboard.util.UserInfoContext;
//import org.apache.rocketmq.dashboard.util.WebUtil;
//import org.apache.rocketmq.remoting.protocol.body.UserInfo;
//import org.apache.rocketmq.tools.admin.MQAdminExt;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//@Service
//@Slf4j
//public class MyRocketMQAdminService {
//
//    @Autowired
//    private UserMQAdminPoolManager userMQAdminPoolManager;
//
//    @Autowired
//    private UserInfoProvider userInfoProvider;
//
//
//    @Autowired
//    private RMQConfigure rmqConfigure;
//
//    public <T> T executeAdminOperationWithSysUser(MQAdminExtCallback<T> callback) {
//        User sysUser = new User(rmqConfigure.getAccessKey(), rmqConfigure.getSecretKey(), 0);
//        return executeAdminOperation(sysUser, callback);
//    }
//
//    public <T> T executeAdminOperationWithUser(MQAdminExtCallback<T> callback) {
//        String username = (String) UserInfoContext.get(WebUtil.USER_NAME);
//        UserInfo userInfo = userInfoProvider.getUserInfoByUsername(username);
//        User user = new User(username, userInfo.getPassword(), UserType.getByName(userInfo.getUserType()).getCode());
//        return executeAdminOperation(user, callback);
//    }
//
//    /**
//     * 执行一个 RocketMQ 管理操作，自动处理 MQAdminExt 实例的借用和归还。
//     *
//     * @param currentUser 当前操作用户，用于确定使用哪个 MQAdminExt 实例池。
//     * @param callback    封装了具体管理操作的回调函数。
//     * @param <T>         回调函数返回的结果类型。
//     * @return 回调函数执行的结果。
//     * @throws RuntimeException 如果在借用/归还或执行回调过程中发生异常，会被包装成 RuntimeException 抛出。
//     */
//    public <T> T executeAdminOperation(User currentUser, MQAdminExtCallback<T> callback) {
//        if (currentUser == null) {
//            throw new IllegalArgumentException("Current user cannot be null for admin operations.");
//        }
//
//        MQAdminExt mqAdminExt = null;
//        try {
//            // 1. 从用户专属的连接池中借用 MQAdminExt 实例
//            // 假设 currentUser.getName() 是 AccessKey，currentUser.getPassword() 是 SecretKey
//            mqAdminExt = userMQAdminPoolManager.borrowMQAdminExt(currentUser.getName(), currentUser.getPassword());
//
//            // 2. 执行回调中定义的具体管理操作
//            return callback.doInMQAdminExt(mqAdminExt);
//
//        } catch (Exception e) {
//            log.error("用户 {} 执行 RocketMQ 管理操作失败: {}", currentUser.getName(), e.getMessage(), e);
//            // 包装并重新抛出为运行时异常，简化调用方异常处理
//            throw new RuntimeException("RocketMQ 管理操作失败: " + e.getMessage(), e);
//        } finally {
//            // 3. ！！非常重要！！ 确保 MQAdminExt 实例最终被归还到池中
//            if (mqAdminExt != null) {
//                userMQAdminPoolManager.returnMQAdminExt(currentUser.getName(), mqAdminExt);
//            }
//        }
//    }
//
//    /**
//     * 当用户登出时调用，关闭其专属的 MQAdminExt 连接池。
//     *
//     * @param user 登出用户。
//     */
//    public void onUserLogout(User user) {
//        if (user != null) {
//            userMQAdminPoolManager.shutdownUserPool(user.getName());
//            log.info("用户 {} 登出，其 MQAdminExt 连接池已关闭。", user.getName());
//        }
//    }
//}
