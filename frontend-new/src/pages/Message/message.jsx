import React, { useState, useEffect } from 'react';
import { Tabs, Form, Select, Input, Button, Table, Spin, DatePicker, Modal, Typography, notification } from 'antd';
import moment from 'moment';
import { SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '../../i18n/LanguageContext';
import MessageDetailViewDialog from "../../components/MessageDetailViewDialog"; // 根据实际路径调整

const { TabPane } = Tabs;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const MessageQueryPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('topic');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Topic 查询状态
    const [allTopicList, setAllTopicList] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [timepickerBegin, setTimepickerBegin] = useState(moment().subtract(1, 'hour')); // 默认一小时前
    const [timepickerEnd, setTimepickerEnd] = useState(moment());
    const [messageShowList, setMessageShowList] = useState([]);
    const [paginationConf, setPaginationConf] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Message Key 查询状态
    const [key, setKey] = useState('');
    const [queryMessageByTopicAndKeyResult, setQueryMessageByTopicAndKeyResult] = useState([]);

    // Message ID 查询状态
    const [messageId, setMessageId] = useState('');

    useEffect(() => {
        // 模拟加载所有 Topic 列表
        setLoading(true);
        setTimeout(() => {
            setAllTopicList(['TopicA', 'TopicB', 'TopicC', '%RETRY%GroupA']);
            setLoading(false);
        }, 500);
    }, []);

    const onChangeQueryCondition = () => {
        // 在实际应用中，这里可能触发一些状态更新或重新查询的逻辑
        console.log("查询条件改变");
    };

    const queryMessagePageByTopic = async (page = 1, pageSize = 10) => {
        if (!selectedTopic) {
            notification.warning({
                message: t.WARNING,
                description: t.PLEASE_SELECT_TOPIC,
            });
            return;
        }
        setLoading(true);
        console.log("根据Topic查询消息:", { selectedTopic, timepickerBegin, timepickerEnd, page, pageSize });
        try {
            // 模拟 API 调用
            const mockMessages = Array.from({ length: 25 }).map((_, i) => ({
                msgId: `msg_${Date.now()}_${i}`,
                topic: selectedTopic,
                properties: { TAGS: `Tag${i % 3}`, KEYS: `Key${i}` },
                storeTimestamp: moment().subtract(i * 10, 'minutes').valueOf(),
            }));

            // 模拟分页
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setMessageShowList(mockMessages.slice(startIndex, endIndex));
            setPaginationConf(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: mockMessages.length, // 实际应为后端返回的总数
            }));
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

    const queryMessageByTopicAndKey = async () => {
        if (!selectedTopic || !key) {
            notification.warning({
                message: t.WARNING,
                description: t.TOPIC_AND_KEY_REQUIRED,
            });
            return;
        }
        setLoading(true);
        console.log("根据Topic和Key查询消息:", { selectedTopic, key });
        try {
            // 模拟 API 调用，只返回64条消息
            const mockMessages = Array.from({ length: Math.min(64, Math.floor(Math.random() * 70)) }).map((_, i) => ({
                msgId: `key_msg_${Date.now()}_${i}`,
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
        console.log("根据Message ID查询消息:", { msgId: msgIdToQuery, topic: topicToQuery });
        try {
            // 模拟 API 调用
            const mockMessageDetail = {
                msgId: msgIdToQuery,
                topic: topicToQuery,
                properties: { TAGS: 'TestTag', KEYS: 'TestKey' },
                storeTimestamp: Date.now(),
                messageBody: 'This is a mock message body content for the queried message.',
            };

            const mockMessageTrackList = [
                { consumerGroup: 'GroupA', trackType: 'CONSUMED', exceptionDesc: null },
                { consumerGroup: 'GroupB', trackType: 'NOT_CONSUMED_YET', exceptionDesc: 'Consumer offline' },
                { consumerGroup: 'GroupC', trackType: 'CONSUME_FAILED', exceptionDesc: 'Deserialization error' },
            ];

            setLoading(false);
            Modal.info({
                title: t.MESSAGE_DETAIL,
                width: 800,
                content: (
                    <MessageDetailViewDialog
                        ngDialogData={{ messageView: mockMessageDetail, messageTrackList: mockMessageTrackList }}
                        resendMessage={handleResendMessage}
                        showExceptionDesc={handleShowExceptionDesc}
                    />
                ),
                onOk: () => {}, // 确保 Modal 可以关闭
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

    const handleResendMessage = async (messageView, consumerGroup) => {
        setLoading(true);
        console.log(`重发消息: MsgId=${messageView.msgId}, ConsumerGroup=${consumerGroup}`);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟API调用
            notification.success({
                message: t.SUCCESS,
                description: t.RESEND_SUCCESS,
            });
            Modal.info({
                title: t.RESULT,
                content: t.RESEND_SUCCESS_DETAIL,
            });
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.RESEND_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleShowExceptionDesc = (desc) => {
        Modal.info({
            title: t.EXCEPTION_DETAILS,
            content: desc || t.NO_EXCEPTION_DETAILS,
            okText: t.CLOSE,
        });
    };

    const topicColumns = [
        { title: 'Message ID', dataIndex: 'msgId', key: 'msgId', align: 'center' },
        { title: 'Tag', dataIndex: ['properties', 'TAGS'], key: 'tags', align: 'center' },
        { title: 'Key', dataIndex: ['properties', 'KEYS'], key: 'keys', align: 'center' },
        {
            title: 'StoreTime',
            dataIndex: 'storeTimestamp',
            key: 'storeTimestamp',
            align: 'center',
            render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => queryMessageByMessageId(record.msgId, record.topic)}>
                    {t.MESSAGE_DETAIL}
                </Button>
            ),
        },
    ];

    const keyColumns = [
        { title: 'Message ID', dataIndex: 'msgId', key: 'msgId', align: 'center' },
        { title: 'Tag', dataIndex: ['properties', 'TAGS'], key: 'tags', align: 'center' },
        { title: 'Key', dataIndex: ['properties', 'KEYS'], key: 'keys', align: 'center' },
        {
            title: 'StoreTime',
            dataIndex: 'storeTimestamp',
            key: 'storeTimestamp',
            align: 'center',
            render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => queryMessageByMessageId(record.msgId, record.topic)}>
                    {t.MESSAGE_DETAIL}
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip="加载中...">
                <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                    <TabPane tab="Topic" key="topic">
                        <h5 style={{ margin: '15px 0' }}>{t.TOTAL_MESSAGES}</h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" form={form} style={{ marginBottom: '20px' }}>
                                <Form.Item label={t.TOPIC}>
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                        value={selectedTopic}
                                        onChange={(value) => {
                                            setSelectedTopic(value);
                                            onChangeQueryCondition();
                                        }}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {allTopicList.map(topic => (
                                            <Option key={topic} value={topic}>{topic}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label={t.BEGIN}>
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={timepickerBegin}
                                        onChange={(date) => {
                                            setTimepickerBegin(date);
                                            onChangeQueryCondition();
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item label={t.END}>
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={timepickerEnd}
                                        onChange={(date) => {
                                            setTimepickerEnd(date);
                                            onChangeQueryCondition();
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => queryMessagePageByTopic()}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Table
                                columns={topicColumns}
                                dataSource={messageShowList}
                                rowKey="msgId"
                                bordered
                                pagination={{
                                    current: paginationConf.current,
                                    pageSize: paginationConf.pageSize,
                                    total: paginationConf.total,
                                    onChange: (page, pageSize) => queryMessagePageByTopic(page, pageSize),
                                }}
                                locale={{ emptyText: t.NO_MATCH_RESULT }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Message Key" key="messageKey">
                        <h5 style={{ margin: '15px 0' }}>{t.ONLY_RETURN_64_MESSAGES}</h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" style={{ marginBottom: '20px' }}>
                                <Form.Item label="Topic:">
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                        value={selectedTopic}
                                        onChange={setSelectedTopic}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
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
                                pagination={false} // Key查询通常不分页
                                locale={{ emptyText: t.NO_MATCH_RESULT }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Message ID" key="messageId">
                        <h5 style={{ margin: '15px 0' }}>
                            {t.MESSAGE_ID_TOPIC_HINT}
                        </h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" style={{ marginBottom: '20px' }}>
                                <Form.Item label="Topic:">
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                        value={selectedTopic}
                                        onChange={setSelectedTopic}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
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
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => queryMessageByMessageId(messageId, selectedTopic)}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                            </Form>
                            {/* Message ID 查询结果通常直接弹窗显示，这里不需要表格 */}
                        </div>
                    </TabPane>
                </Tabs>
            </Spin>
        </div>
    );
};

export default MessageQueryPage;
