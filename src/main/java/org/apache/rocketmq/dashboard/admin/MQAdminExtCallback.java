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

import org.apache.rocketmq.tools.admin.MQAdminExt;

@FunctionalInterface
public interface MQAdminExtCallback<T> {
    /**
     * 在这里执行您需要对 MQAdminExt 实例进行的操作。
     * @param mqAdminExt 可用的 MQAdminExt 实例。
     * @return 操作结果。
     * @throws Exception 如果操作过程中发生错误。
     */
    T doInMQAdminExt(MQAdminExt mqAdminExt) throws Exception;
}
