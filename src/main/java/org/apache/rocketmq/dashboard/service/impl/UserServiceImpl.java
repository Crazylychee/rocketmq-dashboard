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

import org.apache.rocketmq.auth.authentication.enums.UserType;
import org.apache.rocketmq.dashboard.config.RMQConfigure;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.dashboard.service.AclService;
import org.apache.rocketmq.dashboard.service.UserService;
import org.apache.rocketmq.remoting.protocol.body.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.Resource;

@Service
public class UserServiceImpl implements UserService {
    @Resource
    private RMQConfigure configure;

    @Autowired
    private AclService aclService;


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
        configure.setAccessKey(user.getName());
        configure.setSecretKey(user.getPassword());
        return user;
    }

}
