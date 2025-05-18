import React, { useState, useEffect } from 'react';
import { Tabs, Form, Select, Input, Button, Table, Spin, DatePicker, Modal, Typography, notification, Checkbox } from 'antd';
import moment from 'moment';
import { SearchOutlined, SendOutlined, ExportOutlined } from '@ant-design/icons';
import DlqMessageDetailViewDialog from "../../components/DlqMessageDetailViewDialog";
import { useLanguage } from '../../i18n/LanguageContext';

const { TabPane } = Tabs;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const DlqMessageQueryPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('consumer');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Consumer 查询状态
    const [allConsumerGroupList, setAllConsumerGroupList] = useState([]);
    const [selectedConsumerGroup, setSelectedConsumerGroup] = useState(null);
    const [timepickerBegin, setTimepickerBegin] = useState(moment().subtract(1, 'hour')); // 默认一小时前
    const [timepickerEnd, setTimepickerEnd] = useState(moment());
    const [messageShowList, setMessageShowList] = useState([]);
    const [paginationConf, setPaginationConf] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [checkedAll, setCheckedAll] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());

    // Message ID 查询状态
    const [messageId, setMessageId] = useState('');
    const [queryDlqMessageByMessageIdResult, setQueryDlqMessageByMessageIdResult] = useState([]);

    useEffect(() => {
        // 模拟加载所有消费者组列表
        setLoading(true);
        setTimeout(() => {
            setAllConsumerGroupList(['ConsumerGroupA', 'ConsumerGroupB', 'ConsumerGroupC']);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const batchResendBtn = document.getElementById('batchResendBtn');
        const batchExportBtn = document.getElementById('batchExportBtn');
        if (selectedMessageIds.size > 0) {
            batchResendBtn?.classList.remove('disabled');
            batchExportBtn?.classList.remove('disabled');
        } else {
            batchResendBtn?.classList.add('disabled');
            batchExportBtn?.classList.add('disabled');
        }
    }, [selectedMessageIds]);

    const onChangeQueryCondition = () => {
        // 在实际应用中，这里可能触发一些状态更新或重新查询的逻辑
        console.log("查询条件改变");
    };

    const queryDlqMessageByConsumerGroup = async (page = 1, pageSize = 10) => {
        if (!selectedConsumerGroup) {
            notification.warning({
                message: t.WARNING,
                description: t.PLEASE_SELECT_CONSUMER_GROUP,
            });
            return;
        }
        setLoading(true);
        console.log("根据消费者组查询DLQ消息:", { selectedConsumerGroup, timepickerBegin, timepickerEnd, page, pageSize });
        try {
            // 模拟 API 调用
            const mockMessages = Array.from({ length: 25 }).map((_, i) => ({
                msgId: `dlq_msg_${Date.now()}_${i}`,
                topic: `%DLQ%${selectedConsumerGroup}`,
                properties: { TAGS: `DLQTag${i % 3}`, KEYS: `DLQKey${i}` },
                storeTimestamp: moment().subtract(i * 15, 'minutes').valueOf(),
                checked: false, // 添加 checked 属性用于选择
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
            setSelectedMessageIds(new Set()); // 重置选中项
            setCheckedAll(false); // 重置全选状态
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

    const queryDlqMessageByMessageId = async (msgIdToQuery, consumerGroupToQuery) => {
        if (!msgIdToQuery || !consumerGroupToQuery) {
            notification.warning({
                message: t.WARNING,
                description: t.MESSAGE_ID_AND_CONSUMER_GROUP_REQUIRED,
            });
            return;
        }
        setLoading(true);
        console.log("根据Message ID查询DLQ消息:", { msgId: msgIdToQuery, consumerGroup: consumerGroupToQuery });
        try {
            // 模拟 API 调用
            const mockDlqMessage = {
                msgId: msgIdToQuery,
                topic: `%DLQ%${consumerGroupToQuery}`,
                properties: JSON.stringify({ TAGS: 'DLQTestTag', KEYS: 'DLQTestKey', RECONSUME_TIMES: '3' }),
                reconsumeTimes: 3,
                storeTimestamp: Date.now(),
                storeHost: '192.168.1.1:10911',
                messageBody: 'This is a mock DLQ message body content.',
            };
            setQueryDlqMessageByMessageIdResult([mockDlqMessage]);

            if (!mockDlqMessage) { // 如果查询不到
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

    const queryDlqMessageDetail = async (msgId, consumerGroup) => {
        setLoading(true);
        console.log(`查询DLQ消息详情: ${msgId}, 消费者组: ${consumerGroup}`);
        try {
            // 模拟获取消息详情的 API 调用
            const mockMessageDetail = {
                msgId: msgId,
                topic: `%DLQ%${consumerGroup}`,
                properties: { TAGS: 'DLQ_TAG', KEYS: 'DLQ_KEY', someProp: 'value' },
                reconsumeTimes: 5,
                storeTimestamp: Date.now(),
                storeHost: '192.168.1.1:10911',
                messageBody: 'This is the detailed body of the DLQ message.',
            };

            setLoading(false);
            Modal.info({
                title: t.MESSAGE_DETAIL,
                width: 800,
                content: (
                    <DlqMessageDetailViewDialog
                        ngDialogData={{ messageView: mockMessageDetail }}
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

    const resendDlqMessage = async (message, consumerGroup) => {
        setLoading(true);
        console.log(`重发DLQ消息: MsgId=${message.msgId}, 消费者组=${consumerGroup}`);
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
            // 刷新列表
            queryDlqMessageByConsumerGroup(paginationConf.current, paginationConf.pageSize);
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.RESEND_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    const exportDlqMessage = async (msgId, consumerGroup) => {
        setLoading(true);
        console.log(`导出DLQ消息: MsgId=${msgId}, 消费者组=${consumerGroup}`);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟API调用
            notification.success({
                message: t.SUCCESS,
                description: t.EXPORT_SUCCESS,
            });
            Modal.info({
                title: t.RESULT,
                content: t('EXPORT_SUCCESS_DETAIL', { msgId: msgId }),
            });
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.EXPORT_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    const batchResendDlqMessage = async (consumerGroup) => {
        if (selectedMessageIds.size === 0) {
            notification.warning({
                message: t.WARNING,
                description: t.PLEASE_SELECT_MESSAGE_TO_RESEND,
            });
            return;
        }
        setLoading(true);
        const msgIdsToResend = Array.from(selectedMessageIds);
        console.log(`批量重发DLQ消息到 ${consumerGroup}:`, msgIdsToResend);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟批量API调用
            notification.success({
                message: t.SUCCESS,
                description: t.BATCH_RESEND_SUCCESS,
            });
            Modal.info({
                title: t.RESULT,
                content: t('BATCH_RESEND_SUCCESS_DETAIL', { count: msgIdsToResend.length }),
            });
            // 刷新列表和重置选中状态
            queryDlqMessageByConsumerGroup(paginationConf.current, paginationConf.pageSize);
            setSelectedMessageIds(new Set());
            setCheckedAll(false);
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.BATCH_RESEND_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    const batchExportDlqMessage = async (consumerGroup) => {
        if (selectedMessageIds.size === 0) {
            notification.warning({
                message: t.WARNING,
                description: t.PLEASE_SELECT_MESSAGE_TO_EXPORT,
            });
            return;
        }
        setLoading(true);
        const msgIdsToExport = Array.from(selectedMessageIds);
        console.log(`批量导出DLQ消息从 ${consumerGroup}:`, msgIdsToExport);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟批量API调用
            notification.success({
                message: t.SUCCESS,
                description: t.BATCH_EXPORT_SUCCESS,
            });
            Modal.info({
                title: t.RESULT,
                content: t('BATCH_EXPORT_SUCCESS_DETAIL', { count: msgIdsToExport.length }),
            });
            // 刷新列表和重置选中状态
            queryDlqMessageByConsumerGroup(paginationConf.current, paginationConf.pageSize);
            setSelectedMessageIds(new Set());
            setCheckedAll(false);
        } catch (error) {
            notification.error({
                message: t.ERROR,
                description: t.BATCH_EXPORT_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setCheckedAll(checked);
        const newSelectedIds = new Set();
        const updatedList = messageShowList.map(item => {
            if (checked) {
                newSelectedIds.add(item.msgId);
            }
            return { ...item, checked };
        });
        setMessageShowList(updatedList);
        setSelectedMessageIds(newSelectedIds);
    };

    const handleSelectItem = (item, checked) => {
        const newSelectedIds = new Set(selectedMessageIds);
        if (checked) {
            newSelectedIds.add(item.msgId);
        } else {
            newSelectedIds.delete(item.msgId);
        }
        setSelectedMessageIds(newSelectedIds);

        // 更新单项选中状态，并检查是否全选
        const updatedList = messageShowList.map(msg =>
            msg.msgId === item.msgId ? { ...msg, checked } : msg
        );
        setMessageShowList(updatedList);
        setCheckedAll(newSelectedIds.size === updatedList.length && updatedList.length > 0);
    };

    const consumerColumns = [
        {
            title: (
                <Checkbox
                    checked={checkedAll}
                    onChange={handleSelectAll}
                    disabled={messageShowList.length === 0}
                />
            ),
            dataIndex: 'checked',
            key: 'checkbox',
            align: 'center',
            render: (checked, record) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleSelectItem(record, e.target.checked)}
                />
            ),
        },
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
                <>
                    <Button type="primary" size="small" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => queryDlqMessageDetail(record.msgId, selectedConsumerGroup)}>
                        {t.MESSAGE_DETAIL}
                    </Button>
                    <Button type="primary" size="small" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => resendDlqMessage(record, selectedConsumerGroup)}>
                        {t.RESEND_MESSAGE}
                    </Button>
                    <Button type="primary" size="small" style={{ marginBottom: 8 }} onClick={() => exportDlqMessage(record.msgId, selectedConsumerGroup)}>
                        {t.EXPORT}
                    </Button>
                </>
            ),
        },
    ];

    const messageIdColumns = [
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
                <>
                    <Button type="primary" size="small" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => queryDlqMessageDetail(record.msgId, selectedConsumerGroup)}>
                        {t.MESSAGE_DETAIL}
                    </Button>
                    <Button type="primary" size="small" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => resendDlqMessage(record, selectedConsumerGroup)}>
                        {t.RESEND_MESSAGE}
                    </Button>
                    <Button type="primary" size="small" style={{ marginBottom: 8 }} onClick={() => exportDlqMessage(record.msgId, selectedConsumerGroup)}>
                        {t.EXPORT}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip="加载中...">
                <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                    <TabPane tab={t.CONSUMER} key="consumer">
                        <h5 style={{ margin: '15px 0' }}>{t.TOTAL_MESSAGES}</h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" form={form} style={{ marginBottom: '20px' }}>
                                <Form.Item label={t.CONSUMER}>
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_CONSUMER_GROUP_PLACEHOLDER}
                                        value={selectedConsumerGroup}
                                        onChange={(value) => {
                                            setSelectedConsumerGroup(value);
                                            onChangeQueryCondition();
                                        }}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {allConsumerGroupList.map(group => (
                                            <Option key={group} value={group}>{group}</Option>
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
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => queryDlqMessageByConsumerGroup()}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        id="batchResendBtn"
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={() => batchResendDlqMessage(selectedConsumerGroup)}
                                        disabled={selectedMessageIds.size === 0}
                                    >
                                        {t.BATCH_RESEND}
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        id="batchExportBtn"
                                        type="primary"
                                        icon={<ExportOutlined />}
                                        onClick={() => batchExportDlqMessage(selectedConsumerGroup)}
                                        disabled={selectedMessageIds.size === 0}
                                    >
                                        {t.BATCH_EXPORT}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Table
                                columns={consumerColumns}
                                dataSource={messageShowList}
                                rowKey="msgId"
                                bordered
                                pagination={{
                                    current: paginationConf.current,
                                    pageSize: paginationConf.pageSize,
                                    total: paginationConf.total,
                                    onChange: (page, pageSize) => queryDlqMessageByConsumerGroup(page, pageSize),
                                }}
                                locale={{ emptyText: t.NO_MATCH_RESULT }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Message ID" key="messageId">
                        <h5 style={{ margin: '15px 0' }}>
                            {t.MESSAGE_ID_CONSUMER_GROUP_HINT}
                        </h5>
                        <div style={{ padding: '20px', minHeight: '600px' }}>
                            <Form layout="inline" style={{ marginBottom: '20px' }}>
                                <Form.Item label={t.CONSUMER}>
                                    <Select
                                        showSearch
                                        style={{ width: 300 }}
                                        placeholder={t.SELECT_CONSUMER_GROUP_PLACEHOLDER}
                                        value={selectedConsumerGroup}
                                        onChange={setSelectedConsumerGroup}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {allConsumerGroupList.map(group => (
                                            <Option key={group} value={group}>{group}</Option>
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
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => queryDlqMessageByMessageId(messageId, selectedConsumerGroup)}>
                                        {t.SEARCH}
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Table
                                columns={messageIdColumns}
                                dataSource={queryDlqMessageByMessageIdResult}
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

export default DlqMessageQueryPage;
