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

import React, {useEffect, useState} from 'react';
import {Button, Descriptions, Form, Input, Modal, Spin, Switch, Select} from 'antd';
import {remoteApi} from '../../api/remoteApi/remoteApi';
import {useLanguage} from '../../i18n/LanguageContext';

const {Option} = Select;

const ConsumerConfigModal = ({visible, isAddConfig, group, onCancel, setIsAddConfig, onSuccess}) => {
    const {t} = useLanguage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [configData, setConfigData] = useState(null);
    const [brokerList, setBrokerList] = useState([]);
    const [clusterNames, setClusterNames] = useState([]); // State to store cluster names

    // Fetch cluster list and initialize form data
    useEffect(() => {
        if (visible) {
            const fetchInitialData = async () => {
                setLoading(true);
                try {
                    // Fetch cluster list for broker names and cluster names
                    const clusterResponse = await remoteApi.getClusterList();
                    if (clusterResponse.status === 0 && clusterResponse.data) {
                        const clusterInfo = clusterResponse.data.clusterInfo;

                        // Extract all broker names from all clusters
                        const allBrokers = [];
                        const allClusterNames = Object.keys(clusterInfo?.clusterAddrTable || {});

                        allClusterNames.forEach(clusterName => {
                            const brokersInCluster = clusterInfo?.clusterAddrTable?.[clusterName] || [];
                            allBrokers.push(...brokersInCluster);
                        });

                        setBrokerList(allBrokers);

                        // Extract all cluster names (keys of clusterAddrTable)
                        setClusterNames(allClusterNames); // Set the array of cluster names

                    } else {
                        console.error('Failed to fetch cluster list:', clusterResponse.errMsg);
                    }

                    if (!isAddConfig) {
                        // Fetch existing consumer config for update mode
                        const consumerConfigResponse = await remoteApi.queryConsumerConfig(group);
                        if (consumerConfigResponse.status === 0 && consumerConfigResponse.data && consumerConfigResponse.data.length > 0) {
                            setConfigData(consumerConfigResponse.data[0]);
                            form.setFieldsValue({
                                ...consumerConfigResponse.data[0].subscriptionGroupConfig,
                                // Set brokerName and clusterName as arrays for multi-select
                                brokerName: consumerConfigResponse.data[0].brokerNameList,
                                groupName: consumerConfigResponse.data[0].subscriptionGroupConfig.groupName,
                                clusterName: consumerConfigResponse.data[0].clusterNameList
                            });
                        } else {
                            console.error(`Failed to fetch consumer config for group: ${group}`);
                            onCancel(); // Close modal if config not found
                        }
                    } else {
                        // Initialize form for add mode with default values
                        form.setFieldsValue({
                            groupName: undefined, // Allow user to type group name
                            autoCommit: true,
                            enableAutoCommit: true,
                            enableAutoOffsetReset: true,
                            groupSysFlag: 0,
                            consumeTimeoutMinute: 10,
                            consumeEnable: true,
                            consumeMessageOrderly: false,
                            consumeBroadcastEnable: false,
                            retryQueueNums: 1,
                            retryMaxTimes: 16,
                            brokerId: 0,
                            whichBrokerWhenConsumeSlowly: 0,
                            brokerName: [], // Initialize as empty array for multi-select
                            clusterName: [], // Initialize as empty array for multi-select
                        });
                    }
                } catch (error) {
                    console.error('Error in fetching initial data:', error);
                    // Handle network errors or other exceptions
                } finally {
                    setLoading(false);
                }
            };

            fetchInitialData();
        }
    }, [visible, isAddConfig, group, form, onCancel]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const numericValues = {
                retryQueueNums: Number(values.retryQueueNums),
                retryMaxTimes: Number(values.retryMaxTimes),
                brokerId: Number(values.brokerId),
                whichBrokerWhenConsumeSlowly: Number(values.whichBrokerWhenConsumeSlowly),
            };

            const payload = {
                subscriptionGroupConfig: {
                    ...(!isAddConfig && configData ? configData.subscriptionGroupConfig : {}),
                    ...values,
                    ...numericValues,
                    groupName: isAddConfig ? values.groupName : group,
                },
                // brokerName will be an array from multi-select
                brokerNameList: values.brokerName,
                // clusterName will be an array from multi-select, only applicable for add mode
                clusterNameList: isAddConfig ? values.clusterName : null
            };

            const response = await remoteApi.createOrUpdateConsumer(payload);
            if (response.status === 0) {
                onSuccess();
                onCancel();
            } else {
                console.error('Failed to create or update consumer:', response.errMsg);
            }
        } catch (error) {
            console.error('Validation failed or API call error:', error);
        } finally {
            setLoading(false);
            setIsAddConfig(false);
        }
    };

    // Helper function to parse input value to number
    const parseNumber = (event) => {
        const value = event.target.value;
        return value === '' ? undefined : Number(value);
    };

    return (
        <Modal
            title={isAddConfig ? t.ADD_CONSUMER : `${t.CONFIG} - ${group}`}
            visible={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    {t.CLOSE}
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    {t.COMMIT}
                </Button>,
            ]}
        >
            <Spin spinning={loading}>
                {/* Read-only information display (only visible in update mode) */}
                {!isAddConfig && configData && (
                    <Descriptions bordered column={2} style={{marginBottom: 24}}>
                        <Descriptions.Item label="Cluster Names" span={2}>
                            {configData.clusterNameList?.join(', ') || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Retry Policy" span={2}>
                            <pre style={{margin: 0, maxHeight: '200px', overflow: 'auto'}}>
                                {JSON.stringify(
                                    configData.subscriptionGroupConfig.groupRetryPolicy,
                                    null,
                                    2
                                ) || 'N/A'}
                            </pre>
                        </Descriptions.Item>
                        <Descriptions.Item label="Consume Timeout">
                            {`${configData.subscriptionGroupConfig.consumeTimeoutMinute} ${t.MINUTES}` || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="System Flag">
                            {configData.subscriptionGroupConfig.groupSysFlag || 'N/A'}
                        </Descriptions.Item>
                    </Descriptions>
                )}

                {/* Editable Form */}
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="groupName"
                        label="Group Name"
                        rules={[{required: true, message: 'Please input the Group Name!'}]}
                    >
                        <Input disabled={!isAddConfig}/>
                    </Form.Item>

                    {/* Cluster Name Select - Only visible in add mode */}
                    {isAddConfig && (
                        <Form.Item
                            name="clusterName"
                            label="Cluster Name"
                            rules={[{required: true, message: 'Please select at least one Cluster Name!'}]}
                        >
                            <Select
                                mode="multiple" // Enable multiple selection
                                placeholder="Select clusters"
                            >
                                {clusterNames.map((cluster) => (
                                    <Option key={cluster} value={cluster}>
                                        {cluster}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="brokerName"
                        label="Broker Name"
                        rules={[{required: true, message: 'Please select at least one Broker Name!'}]}
                    >
                        <Select
                            mode="multiple" // Enable multiple selection
                            placeholder="Select brokers"
                            disabled={!isAddConfig} // Disable in update mode
                        >
                            {brokerList.map((broker) => (
                                <Option key={broker} value={broker}>
                                    {broker}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="consumeEnable" label="Consume Enable" valuePropName="checked">
                        <Switch/>
                    </Form.Item>

                    <Form.Item name="consumeMessageOrderly" label="Orderly Consumption" valuePropName="checked">
                        <Switch/>
                    </Form.Item>

                    <Form.Item name="consumeBroadcastEnable" label="Broadcast Consumption" valuePropName="checked">
                        <Switch/>
                    </Form.Item>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                        <Form.Item
                            name="retryQueueNums"
                            label="Retry Queues"
                            rules={[{
                                type: 'number',
                                message: 'Please input a number!',
                                transform: value => Number(value)
                            }, {
                                required: true,
                                message: 'Please input retry queue numbers!'
                            }]}
                            getValueFromEvent={parseNumber}
                        >
                            <Input type="number"/>
                        </Form.Item>

                        <Form.Item
                            name="retryMaxTimes"
                            label="Max Retries"
                            rules={[{
                                type: 'number',
                                message: 'Please input a number!',
                                transform: value => Number(value)
                            }, {
                                required: true,
                                message: 'Please input max retries!'
                            }]}
                            getValueFromEvent={parseNumber}
                        >
                            <Input type="number"/>
                        </Form.Item>

                        <Form.Item
                            name="brokerId"
                            label="Broker ID"
                            rules={[{
                                type: 'number',
                                message: 'Please input a number!',
                                transform: value => Number(value)
                            }, {
                                required: true,
                                message: 'Please input a broker ID!'
                            }]}
                            getValueFromEvent={parseNumber}
                        >
                            <Input type="number"/>
                        </Form.Item>

                        <Form.Item
                            name="whichBrokerWhenConsumeSlowly"
                            label="Slow Consumption Broker"
                            rules={[{
                                type: 'number',
                                message: 'Please input a number!',
                                transform: value => Number(value)
                            }, {
                                required: true,
                                message: 'Please input slow consumption broker!'
                            }]}
                            getValueFromEvent={parseNumber}
                        >
                            <Input type="number"/>
                        </Form.Item>
                    </div>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ConsumerConfigModal;
