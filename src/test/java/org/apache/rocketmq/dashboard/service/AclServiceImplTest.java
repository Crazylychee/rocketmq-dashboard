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

package org.apache.rocketmq.dashboard.service;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.rocketmq.dashboard.service.impl.AclServiceImpl;
import org.apache.rocketmq.tools.admin.MQAdminExt;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith; // Required for MockitoJUnitRunner
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations; // Required to initialize mocks
import org.mockito.junit.MockitoJUnitRunner; // Required for Mockito annotations

import static org.mockito.Mockito.*; // For `when` and `verify`

@RunWith(MockitoJUnitRunner.class) // This runner initializes mocks automatically
public class AclServiceImplTest {

    @Mock
    private GenericObjectPool<MQAdminExt> mqAdminExtPool;

    // Use @InjectMocks to inject the mocked dependencies into AclServiceImpl
    @InjectMocks
    private AclServiceImpl aclService;

    @Before
    public void init() {
        // MockitoJUnitRunner.class handles the initialization, so MockitoAnnotations.initMocks(this)
        // is often not strictly necessary if you're using the runner, but it doesn't hurt.
        // If you were not using @RunWith(MockitoJUnitRunner.class), you would need it here.
        MockitoAnnotations.initMocks(this);

        // If 'super.mockRmqConfigure()' is a method from a parent class or a utility,
        // you'll need to ensure that parent class is extended or the method is accessible.
        // For this example, I'm assuming it's not strictly needed for a basic unit test of AclServiceImpl's
        // getAclList() unless it sets up critical static or singleton dependencies.
        // If it's crucial, you'd need to mock or properly configure whatever it affects.
        // super.mockRmqConfigure();
    }

    @Test
    public void getAclListTest() throws Exception { // Add throws Exception for potential pool errors

        // Given: We need to mock the behavior of mqAdminExtPool
        MQAdminExt mockMqAdminExt = mock(MQAdminExt.class); // Create a mock MQAdminExt instance

        // When borrowObject is called, return our mockMqAdminExt
        when(mqAdminExtPool.borrowObject()).thenReturn(mockMqAdminExt);

        // When returnObject is called, do nothing (or verify it's called later)
        doNothing().when(mqAdminExtPool).returnObject(mockMqAdminExt);

        // You might need to mock what getAclList() internally calls on mqAdminExt
        // For example, if it calls mockMqAdminExt.getACLConfig(), you'd mock that:
        // when(mockMqAdminExt.getACLConfig()).thenReturn(someAclConfigObject);

        // When: Call the method under test
        Object aclList = aclService.getAclList();

        // Then: Verify interactions and assertions
        // Verify that borrowObject was called exactly once
        verify(mqAdminExtPool, times(1)).borrowObject();

        // Verify that returnObject was called exactly once with our mockMqAdminExt
        verify(mqAdminExtPool, times(1)).returnObject(mockMqAdminExt);

        // Assertions about the returned aclList
        // Replace 'null' with what you expect getAclList() to return based on your mocks
        // For example:
        // assertNotNull(aclList);
        // assertEquals(expectedList, aclList); // If you know what the list should contain
        System.out.println(aclList);
    }
}
