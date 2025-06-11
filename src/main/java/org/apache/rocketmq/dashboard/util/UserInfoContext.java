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

package org.apache.rocketmq.dashboard.util;

import java.util.HashMap;
import java.util.Map;

public class UserInfoContext {

    private static final ThreadLocal<Map<String, Object>> userThreadLocal = ThreadLocal.withInitial(HashMap::new);

    /**
     * 设置用户信息
     * @param key 用户信息的键
     * @param value 用户信息的值
     */
    public static void set(String key, Object value) {
        userThreadLocal.get().put(key, value);
    }

    /**
     * 获取用户信息
     * @param key 用户信息的键
     * @return 用户信息的值
     */
    public static Object get(String key) {
        return userThreadLocal.get().get(key);
    }

    /**
     * 获取所有用户信息
     * @return 包含所有用户信息的Map
     */
    public static Map<String, Object> getAll() {
        return new HashMap<>(userThreadLocal.get());
    }

    /**
     * 清除当前线程的用户信息
     */
    public static void clear() {
        userThreadLocal.remove();
    }

}
