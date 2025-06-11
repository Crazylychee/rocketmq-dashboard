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

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import org.apache.rocketmq.dashboard.admin.MyRocketMQAdminService;
import org.apache.rocketmq.dashboard.config.RMQConfigure;
import org.apache.rocketmq.dashboard.model.Entry;
import org.apache.rocketmq.dashboard.model.Policy;
import org.apache.rocketmq.dashboard.model.PolicyRequest;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.dashboard.service.AclService;
import org.apache.rocketmq.remoting.protocol.body.AclInfo;
import org.apache.rocketmq.remoting.protocol.body.TopicList;
import org.apache.rocketmq.remoting.protocol.body.UserInfo;
import org.apache.rocketmq.tools.admin.MQAdminExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AclServiceImpl implements AclService {

    private Logger logger = LoggerFactory.getLogger(AclServiceImpl.class);

    @Autowired
    private MyRocketMQAdminService myRocketMQAdminService;

    @Autowired
    private MQAdminExt mqAdminExt;

    @Autowired
    private RMQConfigure rmqConfigure;

    // ClusterInfoService 暂时没有在你的代码中使用，如果需要，请自行导入和使用
    // @Autowired
    // private ClusterInfoService clusterInfoService;

    private static final String DEFAULT_BROKER_ADDRESS = "127.0.0.1:10911"; // 默认Broker地址，可以考虑从配置中读取

    @Override
    public List<UserInfo> listUsers(String brokerAddress) {
        List<UserInfo> userList;
        System.out.println(rmqConfigure.getSecretKey());
        System.out.println(rmqConfigure.getAccessKey());
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            User user = new User("rocketmq32","1234567",1);
            userList = myRocketMQAdminService.executeAdminOperation(user, mqAdminExt -> mqAdminExt.listUser(address, ""));
        } catch (Exception ex) {
            logger.error("Failed to list users from broker: {}", brokerAddress, ex);
            throw new RuntimeException("Failed to list users", ex);
        }
        if (userList == null || userList.isEmpty()) {
            logger.warn("No users found for broker: {}", brokerAddress);
            return new ArrayList<>();
        }
        return userList;
    }

    @Override
    public Object listAcls(String brokerAddress, String searchParam) {
        List<AclInfo> aclList;
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            String user = searchParam != null ? searchParam : "";
            String res = searchParam != null ? searchParam : "";
            aclList =  mqAdminExt.listAcl(address, user, "");
            if(aclList == null) {
                aclList = new ArrayList<>();
            }
            List<AclInfo> resAclList =  mqAdminExt.listAcl(address, "", res);
            if (resAclList != null) {
                aclList.addAll(resAclList);
            }
        } catch (Exception ex) {
            logger.error("Failed to list ACLs from broker: {}", brokerAddress, ex);
            throw new RuntimeException("Failed to list ACLs", ex);
        }
        ObjectMapper mapper = new ObjectMapper();
        Set<String> uniqueAclStrings = new HashSet<>();
        List<AclInfo> resultAclList = new ArrayList<>();

        for (AclInfo acl : aclList) {
            try {
                String aclString = mapper.writeValueAsString(acl);
                if (uniqueAclStrings.add(aclString)) {
                    resultAclList.add(acl);
                }
            } catch (Exception e) {
                logger.error("Error serializing AclInfo", e);
            }
        }
        return resultAclList;
    }

    @Override
    public List<String> createAcl(PolicyRequest policyRequest) {
        List<String> successfulResources = new ArrayList<>();

        if (policyRequest == null || policyRequest.getPolicies() == null || policyRequest.getPolicies().isEmpty()) {
            logger.warn("Policy request is null or policies list is empty. No ACLs to create.");
            return successfulResources;
        }

        String brokerAddress = policyRequest.getBrokerAddress() != null && !policyRequest.getBrokerAddress().isEmpty() ?
                policyRequest.getBrokerAddress() : DEFAULT_BROKER_ADDRESS;
        String subject = policyRequest.getSubject();

        if (subject == null || subject.isEmpty()) {
            throw new IllegalArgumentException("Subject cannot be null or empty.");
        }

        for (Policy policy : policyRequest.getPolicies()) {
            if (policy.getEntries() != null && !policy.getEntries().isEmpty()) {
                for (Entry entry : policy.getEntries()) {
                    if (entry.getResource() != null && !entry.getResource().isEmpty()) {
                        for (String resource : entry.getResource()) {
                            AclInfo aclInfo = new AclInfo();
                            List<AclInfo.PolicyInfo> aclPolicies = new ArrayList<>();
                            AclInfo.PolicyInfo policyInfo = new AclInfo.PolicyInfo();
                            List<AclInfo.PolicyEntryInfo> entries = new ArrayList<>();
                            AclInfo.PolicyEntryInfo entryInfo = new AclInfo.PolicyEntryInfo();

                            entryInfo.setActions(entry.getActions());
                            entryInfo.setDecision(entry.getDecision());
                            entryInfo.setResource(resource);
                            entryInfo.setSourceIps(entry.getSourceIps());
                            entries.add(entryInfo);

                            policyInfo.setEntries(entries);
                            policyInfo.setPolicyType(policy.getPolicyType());
                            aclPolicies.add(policyInfo);

                            aclInfo.setPolicies(aclPolicies);
                            aclInfo.setSubject(subject);

                            try {
                                logger.info("Attempting to create ACL for subject: {}, resource: {} on broker: {}", subject, resource, brokerAddress);
                                mqAdminExt.createAcl(brokerAddress, aclInfo);
                                successfulResources.add(resource);
                                logger.info("Successfully created ACL for subject: {}, resource: {}", subject, resource);
                            } catch (Exception ex) {
                                logger.error("Failed to create ACL for subject: {}, resource: {} on broker: {}", subject, resource, brokerAddress, ex);
                                throw new RuntimeException("Failed to create ACL", ex);
                            }
                        }
                    }
                }
            }
        }
        return successfulResources;
    }

    @Override
    public UserInfo getUser(String brokerAddress, String username) {
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            return mqAdminExt.getUser(address, username);
        } catch (Exception ex) {
            logger.error("Failed to get user: {} from broker: {}", username, brokerAddress, ex);
            throw new RuntimeException("Failed to get user", ex);
        }
    }

    @Override
    public void deleteUser(String brokerAddress, String username) {
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            mqAdminExt.deleteUser(address, username);
        } catch (Exception ex) {
            logger.error("Failed to delete user: {} from broker: {}", username, brokerAddress, ex);
            throw new RuntimeException("Failed to delete user", ex);
        }
    }

    @Override
    public void updateUser(String brokerAddress, UserInfoParam userParam) {
        UserInfo user = new UserInfo();
        user.setUsername(userParam.getUsername());
        user.setPassword(userParam.getPassword());
        user.setUserStatus(userParam.getUserStatus());
        user.setUserType(userParam.getUserType());

        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            mqAdminExt.updateUser(address, user);
        } catch (Exception ex) {
            logger.error("Failed to update user: {} on broker: {}", userParam.getUsername(), brokerAddress, ex);
            throw new RuntimeException("Failed to update user", ex);
        }
    }

    @Override
    public void createUser(String brokerAddress, UserInfoParam userParam) {
        UserInfo user = new UserInfo();
        user.setUsername(userParam.getUsername());
        user.setPassword(userParam.getPassword());
        user.setUserStatus(userParam.getUserStatus());
        user.setUserType(userParam.getUserType());
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            mqAdminExt.createUser(address, user);
        } catch (Exception ex) {
            logger.error("Failed to create user: {} on broker: {}", userParam.getUsername(), brokerAddress, ex);
            throw new RuntimeException("Failed to create user", ex);
        }
    }

    @Override
    public void deleteAcl(String brokerAddress, String subject, String resource) {
        try {
            String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
            String res = resource != null ? resource : "";
            mqAdminExt.deleteAcl(address, subject, res);
        } catch (Exception ex) {
            logger.error("Failed to delete ACL for subject: {} and resource: {} on broker: {}", subject, resource, brokerAddress, ex);
            throw new RuntimeException("Failed to delete ACL", ex);
        }
    }

    @Override
    public void updateAcl(PolicyRequest policyRequest) {

        if (policyRequest == null || policyRequest.getPolicies() == null || policyRequest.getPolicies().isEmpty()) {
            logger.warn("Policy request is null or policies list is empty. No ACLs to update.");
        }

        String brokerAddress = policyRequest.getBrokerAddress() != null && !policyRequest.getBrokerAddress().isEmpty() ?
                policyRequest.getBrokerAddress() : DEFAULT_BROKER_ADDRESS;
        String subject = policyRequest.getSubject();

        if (subject == null || subject.isEmpty()) {
            throw new IllegalArgumentException("Subject cannot be null or empty.");
        }

        for (Policy policy : policyRequest.getPolicies()) {
            if (policy.getEntries() != null && !policy.getEntries().isEmpty()) {
                for (Entry entry : policy.getEntries()) {
                    if (entry.getResource() != null && !entry.getResource().isEmpty()) {
                        for (String resource : entry.getResource()) {
                            AclInfo aclInfo = new AclInfo();
                            List<AclInfo.PolicyInfo> aclPolicies = new ArrayList<>();
                            AclInfo.PolicyInfo policyInfo = new AclInfo.PolicyInfo();
                            List<AclInfo.PolicyEntryInfo> entries = new ArrayList<>();
                            AclInfo.PolicyEntryInfo entryInfo = new AclInfo.PolicyEntryInfo();

                            entryInfo.setActions(entry.getActions());
                            entryInfo.setDecision(entry.getDecision());
                            entryInfo.setResource(resource); // 每次只设置一个 resource
                            entryInfo.setSourceIps(entry.getSourceIps());
                            entries.add(entryInfo);

                            policyInfo.setEntries(entries);
                            policyInfo.setPolicyType(policy.getPolicyType());
                            aclPolicies.add(policyInfo);

                            aclInfo.setPolicies(aclPolicies);
                            aclInfo.setSubject(subject);

                            try {
                                String address = brokerAddress != null && !brokerAddress.isEmpty() ? brokerAddress : DEFAULT_BROKER_ADDRESS;
                                mqAdminExt.updateAcl(address, aclInfo);
                            } catch (Exception ex) {
                                logger.error("Failed to update ACL for subject: {} on broker: {}", subject, brokerAddress, ex);
                                throw new RuntimeException("Failed to update ACL", ex);
                            }
                        }
                    }
                }
            }
        }

    }

    // --- 定义用于接收前端参数的 DTOs ---

    // 用于接收 UserInfo 参数的 DTO
    public static class UserInfoParam {
        private String username;
        private String password;
        private String userStatus;
        private String userType;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getUserStatus() { return userStatus; }
        public void setUserStatus(String userStatus) { this.userStatus = userStatus; }
        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }
    }

    // 用于接收 PolicyInfo 参数的 DTO
    public static class PolicyInfoParam {
        private String policyType;
        private List<PolicyEntryInfoParam> entryParams;

        // Getters and Setters
        public String getPolicyType() { return policyType; }
        public void setPolicyType(String policyType) { this.policyType = policyType; }
        public List<PolicyEntryInfoParam> getEntryParams() { return entryParams; }
        public void setEntryParams(List<PolicyEntryInfoParam> entryParams) { this.entryParams = entryParams; }
    }

    // 用于接收 PolicyEntryInfo 参数的 DTO
    public static class PolicyEntryInfoParam {
        private List<String> actions;
        private String decision;
        private String resource;
        private List<String> sourceIps;

        // Getters and Setters
        public List<String> getActions() { return actions; }
        public void setActions(List<String> actions) { this.actions = actions; }
        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }
        public String getResource() { return resource; }
        public void setResource(String resource) { this.resource = resource; }
        public List<String> getSourceIps() { return sourceIps; }
        public void setSourceIps(List<String> sourceIps) { this.sourceIps = sourceIps; }
    }


}
