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
package org.apache.rocketmq.dashboard.aspect.admin;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.rocketmq.dashboard.admin.UserMQAdminPoolManager;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.dashboard.service.client.MQAdminInstance;
import org.apache.rocketmq.tools.admin.MQAdminExt;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

/**
 * MQAdminAspect is re-engineered to manage MQAdminExt instances
 * on a per-user basis using a ThreadLocal and a user-specific pool manager.
 *
 * !! IMPORTANT !!
 * This aspect assumes that the first argument of the methods being advised
 * in `org.apache.rocketmq.dashboard.service.client.MQAdminExtImpl` is a `User` object.
 * If your method signatures differ, you MUST adjust the logic to extract the user's AccessKey/SecretKey.
 */
@Aspect
@Component // Use @Component for aspects
@Slf4j
public class MQAdminAspect {

    @Autowired
    private UserMQAdminPoolManager userMQAdminPoolManager; // Inject the user-isolated pool manager

    // Pointcut remains the same, targeting methods in MQAdminExtImpl
    @Pointcut("execution(* org.apache.rocketmq.dashboard.service.client.MQAdminExtImpl..*(..))")
    public void mQAdminMethodPointCut() {
    }

    @Around(value = "mQAdminMethodPointCut()")
    public Object aroundMQAdminMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        MQAdminExt mqAdminExt = null; // The MQAdminExt instance borrowed from the pool
        User currentUser = null;     // The user initiating the operation

        try {
            // 1. Extract the current user from the method arguments.
            //    This is crucial for user isolation.
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0 && args[0] instanceof User) {
                currentUser = (User) args[0];
            } else {
                // If the first argument isn't a User, or there's no user,
                // you must adapt this logic to retrieve the user's context.
                // Possible alternatives:
                // - Get from Spring SecurityContextHolder (if using Spring Security)
                // - Get from a custom ThreadLocal set earlier in the request lifecycle
                log.error("Failed to get User object from method arguments for method: {}. User-specific MQAdminExt cannot be provided.",
                        joinPoint.getSignature().toShortString());
                throw new IllegalStateException("Current user context missing for MQAdminExt operation.");
            }

            // 2. Borrow the user-specific MQAdminExt instance.
            //    currentUser.getName() is assumed to be the AccessKey, and currentUser.getPassword() is SecretKey.
            mqAdminExt = userMQAdminPoolManager.borrowMQAdminExt(currentUser.getName(), currentUser.getPassword());

            // 3. Set the borrowed MQAdminExt instance into the ThreadLocal for MQAdminInstance.
            //    This makes it available to MQAdminExtImpl methods.
            MQAdminInstance.setCurrentMQAdminExt(mqAdminExt);
            log.debug("MQAdminExt borrowed for user {} and set in ThreadLocal.", currentUser.getName());

            // 4. Proceed with the original method execution.
            Object result = joinPoint.proceed();
            return result;

        } catch (Exception e) {
            log.error("Error during MQAdminExt operation for user {}: Method={}, Error={}",
                    (currentUser != null ? currentUser.getName() : "N/A"),
                    joinPoint.getSignature().getName(), e.getMessage(), e);
            throw e; // Re-throw the exception to the caller
        } finally {
            // 5. Ensure the MQAdminExt instance is returned to its pool
            //    and the ThreadLocal is cleared, regardless of success or failure.
            if (mqAdminExt != null && currentUser != null) {
                userMQAdminPoolManager.returnMQAdminExt(currentUser.getName(), mqAdminExt);
                MQAdminInstance.clearCurrentMQAdminExt();
                log.debug("MQAdminExt returned for user {} and cleared from ThreadLocal.", currentUser.getName());
            }
            log.debug("Operation {} for user {} cost {}ms",
                    joinPoint.getSignature().getName(),
                    (currentUser != null ? currentUser.getName() : "N/A"),
                    System.currentTimeMillis() - start);
        }
    }
}
