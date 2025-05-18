import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Form, Select, Input, Button, Table, Spin, Modal, Typography, notification } from 'antd';
import moment from 'moment';
import { SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '../../i18n/LanguageContext';
import MessageTraceDetailViewDialog from "../../components/MessageTraceDetailViewDialog"; // 根据实际路径调整
// 引入 D3 或 G6 等图表库，用于绘制消息轨迹图，这里以伪代码表示
// import * as d3 from 'd3'; // 如果使用D3
// import G6 from '@antv/g6'; // 如果使用G6

const { TabPane } = Tabs;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const MessageTraceQueryPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('messageKey');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 轨迹主题选择
    const [allTraceTopicList, setAllTraceTopicList] = useState([]);
    const [selectedTraceTopic, setSelectedTraceTopic] = useState(null);

    // Topic 查询状态 (与MessageQueryPage类似，用于获取消息列表)
    const [allTopicList, setAllTopicList] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [key, setKey] = useState('');
    const [queryMessageByTopicAndKeyResult, setQueryMessageByTopicAndKeyResult] = useState([]);

    // Message ID 查询状态
    const [messageId, setMessageId] = useState('');
    const [queryMessageByMessageIdResult, setQueryMessageByMessageIdResult] = useState([]);

    useEffect(() => {
        // 模拟加载所有 Topic 和 Trace Topic 列表
        setLoading(true);
        setTimeout(() => {
            setAllTopicList(['TopicA', 'TopicB', 'TopicC']);
            setAllTraceTopicList(['RMQ_SYS_TRACE_TOPIC', 'CustomTraceTopic']);
            setLoading(false);
        }, 500);
    }, []);

    const queryMessageByTopicAndKey = async () => {
        if (!selectedTopic || !key) {
            notification.warning({
                message: t.WARNING,
                description: t.TOPIC_AND_KEY_REQUIRED,
            });
            return;
        }
        setLoading(true);
        console.log("根据Topic和Key查询消息 (用于轨迹):", { selectedTopic, key });
        try {
            // 模拟 API 调用，只返回64条消息
            const mockMessages = Array.from({ length: Math.min(64, Math.floor(Math.random() * 70)) }).map((_, i) => ({
                msgId: `trace_key_msg_${Date.now()}_${i}`,
                topic: selectedTopic,
                properties: { TAGS: `Tag${i % 2}`, KEYS: key },
                storeTimestamp: moment().subtract(i * 5, 'minutes').valueOf(),
            }));
            setQueryMessageByTopicAndKeyResult(mockMessages);
            if (mockMessages.length === 0) {
                notification.info({
                    message: t.NO_RESULT,
                    description: t.NO_MATCH_RESULT,
                });
            }
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.QUERY_FAILED,
            });
            console.error("查询失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const queryMessageByMessageId = async (msgIdToQuery, topicToQuery) => {
        if (!msgIdToQuery) {
            notification.warning({
                message: t.WARNING,
                description: t.MESSAGE_ID_REQUIRED,
            });
            return;
        }
        setLoading(true);
        console.log("根据Message ID查询消息 (用于轨迹):", { msgId: msgIdToQuery, topic: topicToQuery });
        try {
            // 模拟 API 调用
            const mockMessage = {
                msgId: msgIdToQuery,
                topic: topicToQuery,
                properties: { TAGS: 'TraceTestTag', KEYS: 'TraceTestKey' },
                storeTimestamp: Date.now(),
            };
            setQueryMessageByMessageIdResult([mockMessage]);

            if (!mockMessage) {
                notification.info({
                    message: t.NO_RESULT,
                    description: t.NO_MATCH_RESULT,
                });
            }
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.QUERY_FAILED,
            });
            console.error("查询失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const queryMessageTraceByMessageId = async (msgId, traceTopic) => {
        setLoading(true);
        console.log(`查询消息轨迹: MsgId=${msgId}, 轨迹主题=${traceTopic || 'RMQ_SYS_TRACE_TOPIC'}`);
        try {
            // 模拟 API 调用返回消息轨迹数据
            const mockTraceData = {
                producerNode: {
                    msgId: msgId,
                    topic: "ExampleTopic",
                    groupName: "ProducerGroup1",
                    keys: "Key123",
                    tags: "TagA",
                    offSetMsgId: "offsetMsgId123",
                    traceNode: {
                        beginTimestamp: moment().subtract(10, 'seconds').valueOf(),
                        endTimestamp: moment().subtract(9, 'seconds').valueOf(),
                        costTime: 1000,
                        msgType: "Normal",
                        clientHost: "192.168.1.100",
                        storeHost: "192.168.1.200:10911",
                        retryTimes: 0
                    },
                    transactionNodeList: [
                        {
                            beginTimestamp: moment().subtract(8, 'seconds').valueOf(),
                            transactionState: "COMMIT_MESSAGE",
                            fromTransactionCheck: true,
                            clientHost: "192.168.1.100",
                            storeHost: "192.168.1.200:10911"
                        }
                    ]
                },
                subscriptionNodeList: [
                    {
                        subscriptionGroup: "ConsumerGroupA",
                        consumeNodeList: [
                            {
                                beginTimestamp: moment().subtract(5, 'seconds').valueOf(),
                                endTimestamp: moment().subtract(4, 'seconds').valueOf(),
                                costTime: 800,
                                status: "CONSUME_OK",
                                retryTimes: 0,
                                clientHost: "192.168.1.101",
                                storeHost: "192.168.1.200:10911"
                            },
                            {
                                beginTimestamp: moment().subtract(3, 'seconds').valueOf(),
                                endTimestamp: moment().subtract(2, 'seconds').valueOf(),
                                costTime: 500,
                                status: "CONSUME_OK",
                                retryTimes: 1,
                                clientHost: "192.168.1.102",
                                storeHost: "192.168.1.200:10911"
                            }
                        ]
                    },
                    {
                        subscriptionGroup: "ConsumerGroupB",
                        consumeNodeList: [
                            {
                                beginTimestamp: moment().subtract(7, 'seconds').valueOf(),
                                endTimestamp: -1, // 模拟未消费完成
                                costTime: -1, // 模拟未消费完成
                                status: "CONSUME_FAILED",
                                retryTimes: 0,
                                clientHost: "192.168.1.103",
                                storeHost: "192.168.1.200:10911"
                            }
                        ]
                    }
                ]
            };

            setLoading(false);
            Modal.info({
                title: t.MESSAGE_TRACE_DETAIL,
                width: '80%', // 调整宽度以容纳图表
                content: (
                    <MessageTraceDetailViewDialog
                        ngDialogData={mockTraceData}
                    />
                ),
                onOk: () => {},
                okText: t.CLOSE,
            });
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.QUERY_FAILED,
            });
            console.error("查询失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const keyColumns = [
        { title: 'Message ID', dataIndex: 'msgId', key: 'msgId', align: 'center' },
        { title: 'Tag', dataIndex: ['properties', 'TAGS'], key: 'tags', align: 'center' },
        { title: 'Message Key', dataIndex: ['properties', 'KEYS'], key: 'keys', align: 'center' },
        {
            title: 'StoreTime',
            dataIndex: 'storeTimestamp',
            key: 'storeTimestamp',
            align: 'center',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => queryMessageTraceByMessageId(record.msgId, selectedTraceTopic)}>
                    {t.MESSAGE_TRACE_DETAIL}
                </Button>
            ),
        },
    ];

    const messageIdColumns = [
        { title: 'Message ID', dataIndex: 'msgId', key: 'msgId', align: 'center' },
        { title: 'Tag', dataIndex: ['properties', 'TAGS'], key: 'tags', align: 'center' },
        { title: 'Message Key', dataIndex: ['properties', 'KEYS'], key: 'keys', align: 'center' },
        {
            title: 'StoreTime',
            dataIndex: 'storeTimestamp',
            key: 'storeTimestamp',
            align: 'center',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => queryMessageTraceByMessageId(record.msgId, selectedTraceTopic)}>
                    {t.MESSAGE_TRACE_DETAIL}
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip="加载中...">
                <div style={{ marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                    <Form layout="inline">
                        <Form.Item label={<Text strong>{t.TRACE_TOPIC}:</Text>}>
                            <Select
                                showSearch
                                style={{ minWidth: 300 }}
                                placeholder={t.SELECT_TRACE_TOPIC_PLACEHOLDER}
                                value={selectedTraceTopic}
                                onChange={setSelectedTraceTopic}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {allTraceTopicList.map(topic => (
                                    <Option key={topic} value={topic}>{topic}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Text type="secondary" style={{ marginLeft: 10 }}>({t.TRACE_TOPIC_HINT})</Text>
                    </Form>
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                    <TabPane tab="Message Key" key="messageKey">
                        <h5 style={{ margin: '15px 0' }}>{t.ONLY_RETURN_64_MESSAGES}</h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" form={form} style={{ marginBottom: '20px' }}>
                                <Form.Item label="Topic:">
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                        value={selectedTopic}
                                        onChange={setSelectedTopic}
                                        required
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        <Option value="">{t.SELECT_TOPIC_PLACEHOLDER}</Option>
                                        {allTopicList.map(topic => (
                                            <Option key={topic} value={topic}>{topic}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Key:">
                                    <Input
                                        style={{ width: 450 }}
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        required
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" icon={<SearchOutlined />} onClick={queryMessageByTopicAndKey}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Table
                                columns={keyColumns}
                                dataSource={queryMessageByTopicAndKeyResult}
                                rowKey="msgId"
                                bordered
                                pagination={false}
                                locale={{ emptyText: t.NO_MATCH_RESULT }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Message ID" key="messageId">
                        <h5 style={{ margin: '15px 0' }}>{t.MESSAGE_ID_TOPIC_HINT}</h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" style={{ marginBottom: '20px' }}>
                                <Form.Item label="Topic:">
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                        value={selectedTopic}
                                        onChange={setSelectedTopic}
                                        required
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        <Option value="">{t.SELECT_TOPIC_PLACEHOLDER}</Option>
                                        {allTopicList.map(topic => (
                                            <Option key={topic} value={topic}>{topic}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="MessageId:">
                                    <Input
                                        style={{ width: 450 }}
                                        value={messageId}
                                        onChange={(e) => setMessageId(e.target.value)}
                                        required
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => queryMessageByMessageId(messageId, selectedTopic)}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Table
                                columns={messageIdColumns}
                                dataSource={queryMessageByMessageIdResult}
                                rowKey="msgId"
                                bordered
                                pagination={false}
                                locale={{ emptyText: t.NO_MATCH_RESULT }}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </Spin>
        </div>
    );
};

export default MessageTraceQueryPage;
