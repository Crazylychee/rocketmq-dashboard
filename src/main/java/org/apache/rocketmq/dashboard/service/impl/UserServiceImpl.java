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

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.rocketmq.auth.authentication.enums.UserType;
import org.apache.rocketmq.dashboard.admin.UserMQAdminPoolManager;
import org.apache.rocketmq.dashboard.config.RMQConfigure;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.dashboard.service.AclService;
import org.apache.rocketmq.dashboard.service.UserService;
import org.apache.rocketmq.logging.org.slf4j.Logger;
import org.apache.rocketmq.logging.org.slf4j.LoggerFactory;
import org.apache.rocketmq.remoting.protocol.body.UserInfo;
import org.apache.rocketmq.tools.admin.MQAdminExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.Resource;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Resource
    private RMQConfigure configure;

    @Autowired
    private AclService aclService;

    @Autowired
    private UserMQAdminPoolManager userMQAdminPoolManager;


    @Override
    public User queryByName(String name) {
        UserInfo userInfo = aclService.getUser("",name);
        if (userInfo == null) {
            return null;
        }
        return new User(userInfo.getUsername(), userInfo.getPassword(), UserType.getByName(userInfo.getUserType()).getCode());
    }

    @Override
    public User queryByUsernameAndPassword(String username, String password) {
        User user = queryByName(username);
        if(user.getPassword() == null || !user.getPassword().equals(password)) {
            return null;
        }

        return user;
    }
    /**
     * 为已登录的用户获取一个 MQAdminExt 实例。
     * 这个实例将从该用户专属的对象池中借用。
     *
     * @param user 已登录的用户对象，包含其 AK/SK。
     * @return 用户的 MQAdminExt 实例。
     * @throws Exception 如果获取或创建实例失败。
     */
    public MQAdminExt getMQAdminExtForUser(User user) throws Exception {
        if (user == null) {
            throw new IllegalArgumentException("User object cannot be null when requesting MQAdminExt.");
        }
        // 使用用户的名称作为 AccessKey (或您实际的 AccessKey 字段) 来标识池
        return userMQAdminPoolManager.borrowMQAdminExt(user.getName(), user.getPassword());
    }

    /**
     * 将 MQAdminExt 实例归还给其用户专属的对象池。
     *
     * @param user       用户对象。
     * @param mqAdminExt 要归还的 MQAdminExt 实例。
     */
    public void returnMQAdminExtForUser(User user, MQAdminExt mqAdminExt) {
        if (user == null || mqAdminExt == null) {
            log.warn("Attempted to return MQAdminExt with null user or mqAdminExt object.");
            return;
        }
        userMQAdminPoolManager.returnMQAdminExt(user.getName(), mqAdminExt);
    }

    /**
     * 当用户会话结束或注销时调用此方法，以关闭并移除该用户专属的对象池。
     *
     * @param user 用户对象。
     */
    public void onUserLogout(User user) {
        if (user != null) {
            userMQAdminPoolManager.shutdownUserPool(user.getName());
            log.info("User {} logged out, their MQAdminExt pool has been shut down.", user.getName());
        }
    }

}
