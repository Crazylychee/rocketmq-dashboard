import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Table, message } from 'antd';
import {remoteApi} from '../../api/remoteApi/remoteApi'; // Adjust path if needed

const { Option } = Select;

const ProducerConnectionList = () => {
    const [form] = Form.useForm();
    const [allTopicList, setAllTopicList] = useState([]);
    const [connectionList, setConnectionList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch topic list on component mount
        remoteApi.queryTopic((resp) => {
            if (resp.status === 0) {
                setAllTopicList(resp.data.topicList.sort());
            } else {
                message.error(resp.errMsg || "Failed to fetch topic list");
            }
        });
    }, []);

    const onFinish = (values) => {
        setLoading(true);
        const { selectedTopic, producerGroup } = values;
        remoteApi.queryProducerConnection(selectedTopic, producerGroup, (resp) => {
            if (resp.status === 0) {
                setConnectionList(resp.data.connectionSet);
            } else {
                message.error(resp.errMsg || "Failed to fetch producer connection list");
            }
            setLoading(false);
        });
    };

    const columns = [
        {
            title: 'clientId',
            dataIndex: 'clientId',
            key: 'clientId',
            align: 'center',
        },
        {
            title: 'clientAddr',
            dataIndex: 'clientAddr',
            key: 'clientAddr',
            align: 'center',
        },
        {
            title: 'language',
            dataIndex: 'language',
            key: 'language',
            align: 'center',
        },
        {
            title: 'version',
            dataIndex: 'versionDesc',
            key: 'versionDesc',
            align: 'center',
        },
    ];

    return (
        <div className="container-fluid" id="deployHistoryList">
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 20 }}
            >
                <Form.Item label="TOPIC" name="selectedTopic" rules={[{ required: true, message: 'Please select a topic!' }]}>
                    <Select
                        showSearch
                        placeholder="Select a topic"
                        style={{ width: 300 }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {allTopicList.map((topic) => (
                            <Option key={topic} value={topic}>{topic}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="PRODUCER_GROUP" name="producerGroup" rules={[{ required: true, message: 'Please input producer group!' }]}>
                    <Input style={{ width: 300 }} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        <span className="glyphicon glyphicon-search"></span> SEARCH
                    </Button>
                </Form.Item>
            </Form>
            <Table
                dataSource={connectionList}
                columns={columns}
                rowKey="clientId" // Assuming clientId is unique
                pagination={false}
                bordered
            />
        </div>
    );
};

export default ProducerConnectionList;
