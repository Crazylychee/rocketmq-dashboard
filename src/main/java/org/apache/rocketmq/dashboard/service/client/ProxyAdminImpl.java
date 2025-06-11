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
package org.apache.rocketmq.dashboard.service.client;

import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.dashboard.model.User;
import org.apache.rocketmq.remoting.RemotingClient;
import org.apache.rocketmq.remoting.exception.RemotingConnectException;
import org.apache.rocketmq.remoting.exception.RemotingSendRequestException;
import org.apache.rocketmq.remoting.exception.RemotingTimeoutException;
import org.apache.rocketmq.remoting.protocol.RemotingCommand;
import org.apache.rocketmq.remoting.protocol.body.ConsumerConnection;
import org.apache.rocketmq.remoting.protocol.header.GetConsumerConnectionListRequestHeader;
import org.springframework.stereotype.Service;

import static org.apache.rocketmq.remoting.protocol.RequestCode.GET_CONSUMER_CONNECTION_LIST;


// 假设你的 User 类在此处可访问
// import com.example.yourproject.model.User;

@Slf4j
@Service
public class ProxyAdminImpl implements ProxyAdmin { // Assuming ProxyAdmin is an interface

    // 适配后，这里不再需要注入 mqAdminExtPool
    // @Autowired
    // private GenericObjectPool<MQAdminExt> mqAdminExtPool;

    @Override
    public ConsumerConnection examineConsumerConnectionInfo(String addr, String consumerGroup)
            throws RemotingConnectException, RemotingSendRequestException, RemotingTimeoutException, InterruptedException, MQBrokerException {
        // !! 重要：此方法需要从调用方接收当前操作用户的身份信息 !!
        // 否则无法与用户隔离的 MQAdminExt 实例关联。
        // 这里为了演示适配，我添加了一个 User 参数。
        // 你的实际调用方（如某个 Controller 或业务服务）需要提供这个 User 对象。
        //
        // 假设 `ProxyAdmin` 接口也已更新，或者你只在实现类中添加此参数
        // 更推荐的做法是让 `ProxyAdmin` 接口也接受 `User` 对象
        throw new UnsupportedOperationException("This method requires a User object. Please use the adapted method or update the interface.");
    }

    /**
     * 适配后的方法，增加了 `User` 参数以支持用户隔离。
     *
     * @param currentUser 操作用户。
     * @param addr Broker 地址。
     * @param consumerGroup 消费组。
     * @return 消费者连接信息。
     * @throws RemotingConnectException 连接异常。
     * @throws RemotingSendRequestException 发送请求异常。
     * @throws RemotingTimeoutException 请求超时异常。
     * @throws InterruptedException 中断异常。
     * @throws MQBrokerException Broker 异常。
     */
    public ConsumerConnection examineConsumerConnectionInfo(User currentUser, String addr, String consumerGroup)
            throws RemotingConnectException, RemotingSendRequestException, RemotingTimeoutException, InterruptedException, MQBrokerException {
        // 核心修改：移除 try-finally 中的 mqAdminExtPool.borrowObject() 和 returnObject() 调用。
        // 它们的职责已经转移到 MQAdminAspect 中。

        // 直接通过 MQAdminInstance 获取当前线程绑定的 RemotingClient。
        // 这个 RemotingClient 已经通过 MQAdminAspect 和 UserMQAdminPoolManager 绑定到当前用户的 MQAdminExt 实例。
        RemotingClient remotingClient = MQAdminInstance.threadLocalRemotingClient();

        if (remotingClient == null) {
            // 这表示 MQAdminAspect 没有正确地在当前线程中设置 RemotingClient，
            // 通常是由于方法没有被切面拦截，或者用户上下文丢失。
            throw new IllegalStateException("RemotingClient is not available in the current thread. " +
                    "Ensure the method is correctly advised by MQAdminAspect " +
                    "and the user context is provided.");
        }

        log.debug("User {} examining consumer connection for group {} at addr {}", currentUser.getName(), consumerGroup, addr);

        GetConsumerConnectionListRequestHeader requestHeader = new GetConsumerConnectionListRequestHeader();
        requestHeader.setConsumerGroup(consumerGroup);
        RemotingCommand request = RemotingCommand.createRequestCommand(GET_CONSUMER_CONNECTION_LIST, requestHeader);

        RemotingCommand response = remotingClient.invokeSync(addr, request, 3000);

        switch (response.getCode()) {
            case 0:
                log.debug("Successfully got consumer connection for user {}", currentUser.getName());
                return ConsumerConnection.decode(response.getBody(), ConsumerConnection.class);
            default:
                log.error("Failed to get consumer connection for user {}: code={}, remark={}, addr={}",
                        currentUser.getName(), response.getCode(), response.getRemark(), addr);
                throw new MQBrokerException(response.getCode(), response.getRemark(), addr);
        }
    }
}
