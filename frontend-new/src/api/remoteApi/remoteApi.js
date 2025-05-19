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
// 可以是单独的 api.js 或 utils/api.js 文件
// appConfig 应该根据你的项目实际情况定义，例如在 src/config.js
// src/api/remoteApi/remoteApi.js (或你存放 remoteApi 和 tools 的文件)

// appConfig 应该根据你的项目实际情况定义，例如在 src/config.js
const appConfig = {
    apiBaseUrl: 'http://localhost:8080' // 请替换为你的实际 API Base URL
};

const remoteApi = {
    buildUrl: (endpoint) => {
        if (endpoint.charAt(0) === '/') {
            endpoint = endpoint.substring(1);
        }
        return `${appConfig.apiBaseUrl}/${endpoint}`;
    },

    queryClusterList: async (callback) => {
        try {
            const response = await fetch(remoteApi.buildUrl("/cluster/list.query"));
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error("Error fetching cluster list:", error);
            callback({ status: 1, errMsg: "Failed to fetch cluster list" });
        }
    },

    queryBrokerConfig: async (brokerAddr, callback) => {
        try {
            const url = new URL(remoteApi.buildUrl('/cluster/brokerConfig.query'));
            url.searchParams.append('brokerAddr', brokerAddr);
            const response = await fetch(url.toString());
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error("Error fetching broker config:", error);
            callback({ status: 1, errMsg: "Failed to fetch broker config" });
        }
    },
};

const tools = {
    // 适配新的数据结构
    generateBrokerMap: (brokerServer, clusterAddrTable, brokerAddrTable) => {
        const clusterMap = {}; // 最终存储 { clusterName: [brokerInstance1, brokerInstance2, ...] }

        // 遍历集群名到 brokerName 的映射
        Object.entries(clusterAddrTable).forEach(([clusterName, brokerNamesInCluster]) => {
            clusterMap[clusterName] = []; // 初始化当前集群的 broker 列表

            brokerNamesInCluster.forEach(brokerName => {
                // 从 brokerAddrTable 获取当前 brokerName 下的所有 brokerId 及其地址
                const brokerAddrs = brokerAddrTable[brokerName]?.brokerAddrs; // 确保 brokerAddrs 存在

                if (brokerAddrs) {
                    Object.entries(brokerAddrs).forEach(([brokerIdStr, address]) => {
                        const brokerId = parseInt(brokerIdStr); // brokerId 是字符串，转为数字

                        // 从 brokerServer 获取当前 brokerName 和 brokerId 对应的详细信息
                        const detail = brokerServer[brokerName]?.[brokerIdStr];

                        if (detail) {
                            clusterMap[clusterName].push({
                                // 基础信息
                                brokerName: brokerName,
                                brokerId: brokerId,
                                address: address, // 从 brokerAddrTable 获取的地址

                                // 从 brokerServer 复制所有详细数据
                                ...detail,

                                // 额外添加，方便 showDetail 直接使用 record
                                detail: detail,
                                brokerConfig: {}, // 占位符，配置是点击时动态加载的
                            });
                        } else {
                            console.warn(`No detail found for broker: ${brokerName} with ID: ${brokerIdStr}`);
                        }
                    });
                } else {
                    console.warn(`No addresses found for brokerName: ${brokerName} in brokerAddrTable`);
                }
            });
        });
        return clusterMap;
    }
};

export { remoteApi, tools };
