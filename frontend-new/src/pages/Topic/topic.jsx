import React, { useState, useEffect, useRef } from 'react';
import {
    Input,
    Checkbox,
    Button,
    Table,
    Modal,
    Form,
    Select,
    DatePicker,
    Popconfirm,
    message,
    Space
} from 'antd';
import { useLanguage } from '../../i18n/LanguageContext'; // Adjust the path as per your project structure
import moment from 'moment'; // For date/time handling

const { Option } = Select;

// Component for the main Topic List and Filter section
const DeployHistoryList = () => {
    const { t } = useLanguage();
    const [filterStr, setFilterStr] = useState('');
    const [filterNormal, setFilterNormal] = useState(false);
    const [filterDelay, setFilterDelay] = useState(false);
    const [filterFifo, setFilterFifo] = useState(false);
    const [filterTransaction, setFilterTransaction] = useState(false);
    const [filterUnspecified, setFilterUnspecified] = useState(false);
    const [filterRetry, setFilterRetry] = useState(false);
    const [filterDLQ, setFilterDLQ] = useState(false);
    const [filterSystem, setFilterSystem] = useState(false);
    const [rmqVersion, setRmqVersion] = useState(true); // Assuming rmqVersion is a boolean
    const [writeOperationEnabled, setWriteOperationEnabled] = useState(true); // Assuming writeOperationEnabled is a boolean

    // Mock data for topicShowList - replace with actual data fetching
    const [topicShowList, setTopicShowList] = useState([
        'topic-normal-01',
        'topic-delay-02',
        '%SYS%topic-system-03',
        'topic-fifo-04',
        'topic-transaction-05',
        'topic-retry-06',
        'topic-dlq-07',
        'another-topic',
    ]);

    // Dialog visibility states
    const [isAddUpdateTopicModalVisible, setIsAddUpdateTopicModalVisible] = useState(false);
    const [isResetOffsetResultModalVisible, setIsResetOffsetResultModalVisible] = useState(false);
    const [isSendResultModalVisible, setIsSendResultModalVisible] = useState(false);
    const [isConsumerViewModalVisible, setIsConsumerViewModalVisible] = useState(false);
    const [isConsumerResetOffsetModalVisible, setIsConsumerResetOffsetModalVisible] = useState(false);
    const [isSkipMessageAccumulateModalVisible, setIsSkipMessageAccumulateModalVisible] = useState(false);
    const [isStatsViewModalVisible, setIsStatsViewModalVisible] = useState(false);
    const [isRouterViewModalVisible, setIsRouterViewModalVisible] = useState(false);
    const [isSendTopicMessageModalVisible, setIsSendTopicMessageModalVisible] = useState(false);


    // Data for dialogs
    const [currentTopicForDialogs, setCurrentTopicForDialogs] = useState('');
    const [topicModifyData, setTopicModifyData] = useState({});
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [resetOffsetResultData, setResetOffsetResultData] = useState(null);
    const [sendResultData, setSendResultData] = useState(null);
    const [consumerData, setConsumerData] = useState(null);
    const [allConsumerGroupList, setAllConsumerGroupList] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [sendTopicMessageData, setSendTopicMessageData] = useState({
        topic: '',
        tag: '',
        key: '',
        messageBody: '',
        traceEnabled: false,
    });


    // Mock data for dropdowns in topicModifyDialog
    const allClusterNameList = ['ClusterA', 'ClusterB', 'ClusterC'];
    const allBrokerNameList = ['Broker1', 'Broker2', 'Broker3'];
    const allMessageTypeList = {
        'NORMAL': t.NORMAL,
        'DELAY': t.DELAY,
        'FIFO': t.FIFO,
        'TRANSACTION': t.TRANSACTION,
        'UNSPECIFIED': t.UNSPECIFIED,
    };

    // Pagination config (tm-pagination equivalent)
    const [paginationConf, setPaginationConf] = useState({
        current: 1,
        pageSize: 10,
        total: topicShowList.length,
        onChange: (page, pageSize) => {
            // Implement actual pagination logic here
            console.log('Page:', page, 'PageSize:', pageSize);
        },
    });

    // Handle refresh topic list
    const refreshTopicList = () => {
        message.info(t.REFRESHING_TOPIC_LIST);
        // In a real application, you would fetch data here
        // For now, we'll just re-render with existing data
        setTopicShowList([...topicShowList]);
    };

    // Open Add/Update Topic Dialog
    const openAddUpdateDialog = (topic = '', isSys = false) => {
        setIsUpdateMode(!!topic); // True if topic is provided (update mode)
        setCurrentTopicForDialogs(topic);
        if (topic) {
            // In update mode, populate data (mocked here)
            setTopicModifyData({
                clusterNameList: ['ClusterA'],
                brokerNameList: ['Broker1'],
                topicName: topic,
                messageType: 'NORMAL',
                writeQueueNums: 8,
                readQueueNums: 8,
                perm: 7,
            });
        } else {
            // In add mode, initialize with default values
            setTopicModifyData({
                clusterNameList: [],
                brokerNameList: [],
                topicName: '',
                messageType: 'NORMAL',
                writeQueueNums: 8,
                readQueueNums: 8,
                perm: 7,
            });
        }
        setIsAddUpdateTopicModalVisible(true);
    };

    // Close Add/Update Topic Dialog
    const closeAddUpdateDialog = () => {
        setIsAddUpdateTopicModalVisible(false);
        setTopicModifyData({}); // Clear data
    };

    // Post Topic Request (Add/Update)
    const postTopicRequest = (values) => {
        console.log('Submitting topic request:', values);
        // Implement API call to add/update topic
        message.success(t.TOPIC_OPERATION_SUCCESS);
        closeAddUpdateDialog();
        refreshTopicList(); // Refresh list after operation
    };

    // Open Stats View Dialog
    const statsView = (topic) => {
        setCurrentTopicForDialogs(topic);
        // Mock data for stats - replace with actual API call
        setStatsData({
            offsetTable: {
                'broker-1-queue-0': { minOffset: 0, maxOffset: 1000, lastUpdateTimestamp: Date.now() },
                'broker-1-queue-1': { minOffset: 0, maxOffset: 1200, lastUpdateTimestamp: Date.now() },
                'broker-2-queue-0': { minOffset: 0, maxOffset: 800, lastUpdateTimestamp: Date.now() },
            },
        });
        setIsStatsViewModalVisible(true);
    };

    // Open Router View Dialog
    const routerView = (topic) => {
        setCurrentTopicForDialogs(topic);
        // Mock data for router - replace with actual API call
        setRouteData({
            brokerDatas: [
                {
                    brokerName: 'broker-a',
                    brokerAddrs: { '0': '192.168.1.1:10911', '1': '192.168.1.2:10911' },
                },
                {
                    brokerName: 'broker-b',
                    brokerAddrs: { '0': '192.168.1.3:10911' },
                },
            ],
            queueDatas: [
                { brokerName: 'broker-a', readQueueNums: 8, writeQueueNums: 8, perm: 7 },
                { brokerName: 'broker-b', readQueueNums: 4, writeQueueNums: 4, perm: 7 },
            ],
        });
        setIsRouterViewModalVisible(true);
    };

    // Open Consumer View Dialog
    const consumerView = (topic) => {
        setCurrentTopicForDialogs(topic);
        // Mock data for consumer view - replace with actual API call
        const mockConsumerData = {
            'ConsumerGroupA': {
                diffTotal: 150,
                lastTimestamp: Date.now() - 3600 * 1000, // 1 hour ago
                queueStatInfoList: [
                    { brokerName: 'broker-1', queueId: 0, clientInfo: 'clientA@192.168.1.100', brokerOffset: 1000, consumerOffset: 900, lastTimestamp: Date.now() - 3600 * 1000 },
                    { brokerName: 'broker-1', queueId: 1, clientInfo: 'clientA@192.168.1.100', brokerOffset: 1200, consumerOffset: 1150, lastTimestamp: Date.now() - 3600 * 1000 },
                ],
            },
            'ConsumerGroupB': {
                diffTotal: 50,
                lastTimestamp: Date.now() - 1200 * 1000, // 20 minutes ago
                queueStatInfoList: [
                    { brokerName: 'broker-2', queueId: 0, clientInfo: 'clientB@192.168.1.101', brokerOffset: 800, consumerOffset: 750, lastTimestamp: Date.now() - 1200 * 1000 },
                ],
            },
        };
        setConsumerData(mockConsumerData);
        setAllConsumerGroupList(Object.keys(mockConsumerData));
        setIsConsumerViewModalVisible(true);
    };

    // Open Consumer Reset Offset Dialog
    const openConsumerResetOffsetDialog = (topic) => {
        setCurrentTopicForDialogs(topic);
        // Fetch consumer groups for the topic (mocked here)
        setAllConsumerGroupList(['ConsumerGroupA', 'ConsumerGroupB']);
        setIsConsumerResetOffsetModalVisible(true);
    };

    // Open Skip Message Accumulate Dialog
    const openSkipMessageAccumulateDialog = (topic) => {
        setCurrentTopicForDialogs(topic);
        // Fetch consumer groups for the topic (mocked here)
        setAllConsumerGroupList(['ConsumerGroupA', 'ConsumerGroupB']);
        setIsSkipMessageAccumulateModalVisible(true);
    };

    // Delete Topic
    const deleteTopic = (topicToDelete) => {
        console.log(`Deleting topic: ${topicToDelete}`);
        // Implement API call to delete topic
        message.success(`${t.TOPIC} [${topicToDelete}] ${t.DELETED_SUCCESSFULLY}`);
        setTopicShowList(topicShowList.filter(topic => topic !== topicToDelete)); // Update UI
    };

    // Open Send Topic Message Dialog
    const openSendTopicMessageDialog = (topic) => {
        setCurrentTopicForDialogs(topic);
        setSendTopicMessageData(prev => ({ ...prev, topic: topic }));
        setIsSendTopicMessageModalVisible(true);
    };

    // Filtered topics for display in the table
    const filteredTopicList = topicShowList.filter(fTopic => {
        const topicName = fTopic.startsWith('%SYS%') ? fTopic.substring(5) : fTopic;
        const isSystemTopic = fTopic.startsWith('%SYS%');

        let matches = true;
        if (filterStr && !topicName.toLowerCase().includes(filterStr.toLowerCase())) {
            matches = false;
        }

        // Apply type filters
        const isNormal = !isSystemTopic && !fTopic.includes('DELAY') && !fTopic.includes('FIFO') && !fTopic.includes('TRANSACTION') && !fTopic.includes('RETRY') && !fTopic.includes('DLQ');
        const isDelay = fTopic.includes('DELAY');
        const isFifo = fTopic.includes('FIFO');
        const isTransaction = fTopic.includes('TRANSACTION');
        const isRetry = fTopic.includes('RETRY');
        const isDLQ = fTopic.includes('DLQ');
        const isUnspecified = !isNormal && !isDelay && !isFifo && !isTransaction && !isRetry && !isDLQ && !isSystemTopic;

        let typeMatch = false;
        if (filterNormal && isNormal) typeMatch = true;
        if (filterDelay && isDelay) typeMatch = true;
        if (filterFifo && isFifo) typeMatch = true;
        if (filterTransaction && isTransaction) typeMatch = true;
        if (filterUnspecified && isUnspecified) typeMatch = true;
        if (filterRetry && isRetry) typeMatch = true;
        if (filterDLQ && isDLQ) typeMatch = true;
        if (filterSystem && isSystemTopic) typeMatch = true;

        if (!filterNormal && !filterDelay && !filterFifo && !filterTransaction && !filterUnspecified && !filterRetry && !filterDLQ && !filterSystem) {
            // If no type filters are selected, show all topics
            typeMatch = true;
        }


        return matches && typeMatch;
    });


    const columns = [
        {
            title: t.TOPIC,
            dataIndex: 'fTopic',
            key: 'topic',
            align: 'center',
            render: (text) => {
                const sysFlag = text.startsWith('%SYS%');
                const topic = sysFlag ? text.substring(5) : text;
                return <span style={{ color: sysFlag ? 'red' : '' }}>{topic}</span>;
            },
        },
        {
            title: t.OPERATION,
            key: 'operation',
            align: 'left',
            render: (_, record) => {
                const sysFlag = false;
                const topicName = sysFlag ? record.substring(5) : record;
                return (
                    <Space size="small">
                        <Button type="primary" size="small" onClick={() => statsView(topicName)}>
                            {t.STATUS}
                        </Button>
                        <Button type="primary" size="small" onClick={() => routerView(topicName)}>
                            {t.ROUTER}
                        </Button>
                        <Button type="primary" size="small" onClick={() => consumerView(topicName)}>
                            Consumer {t.MANAGE}
                        </Button>
                        <Button type="primary" size="small" onClick={() => openAddUpdateDialog(topicName, sysFlag)}>
                            Topic {t.CONFIG}
                        </Button>
                        {!sysFlag && (
                            <Button type="primary" size="small" onClick={() => openSendTopicMessageDialog(topicName)}>
                                {t.SEND_MSG}
                            </Button>
                        )}
                        {!sysFlag && writeOperationEnabled && (
                            <Button type="danger" size="small" onClick={() => openConsumerResetOffsetDialog(topicName)}>
                                {t.RESET_CUS_OFFSET}
                            </Button>
                        )}
                        {!sysFlag && writeOperationEnabled && (
                            <Button type="danger" size="small" onClick={() => openSkipMessageAccumulateDialog(topicName)}>
                                {t.SKIP_MESSAGE_ACCUMULATE}
                            </Button>
                        )}
                        {!sysFlag && writeOperationEnabled && (
                            <Popconfirm
                                title={`${t.ARE_YOU_SURE_TO_DELETE}?`}
                                onConfirm={() => deleteTopic(topicName)}
                                okText={t.YES}
                                cancelText={t.NO}
                            >
                                <Button type="danger" size="small">
                                    {t.DELETE}
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="container-fluid" id="deployHistoryList">
            <div className="modal-body">
                <div className="row">
                    <Form layout="inline" className="pull-left col-sm-12">
                        <Form.Item label={t.TOPIC}>
                            <Input
                                value={filterStr}
                                onChange={(e) => setFilterStr(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Checkbox checked={filterNormal} onChange={(e) => setFilterNormal(e.target.checked)}>
                                {t.NORMAL}
                            </Checkbox>
                        </Form.Item>
                        {rmqVersion && (
                            <>
                                <Form.Item>
                                    <Checkbox checked={filterDelay} onChange={(e) => setFilterDelay(e.target.checked)}>
                                        {t.DELAY}
                                    </Checkbox>
                                </Form.Item>
                                <Form.Item>
                                    <Checkbox checked={filterFifo} onChange={(e) => setFilterFifo(e.target.checked)}>
                                        {t.FIFO}
                                    </Checkbox>
                                </Form.Item>
                                <Form.Item>
                                    <Checkbox checked={filterTransaction} onChange={(e) => setFilterTransaction(e.target.checked)}>
                                        {t.TRANSACTION}
                                    </Checkbox>
                                </Form.Item>
                                <Form.Item>
                                    <Checkbox checked={filterUnspecified} onChange={(e) => setFilterUnspecified(e.target.checked)}>
                                        {t.UNSPECIFIED}
                                    </Checkbox>
                                </Form.Item>
                            </>
                        )}
                        <Form.Item>
                            <Checkbox checked={filterRetry} onChange={(e) => setFilterRetry(e.target.checked)}>
                                {t.RETRY}
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Checkbox checked={filterDLQ} onChange={(e) => setFilterDLQ(e.target.checked)}>
                                {t.DLQ}
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Checkbox checked={filterSystem} onChange={(e) => setFilterSystem(e.target.checked)}>
                                {t.SYSTEM}
                            </Checkbox>
                        </Form.Item>
                        {writeOperationEnabled && (
                            <Form.Item>
                                <Button type="primary" onClick={() => openAddUpdateDialog()}>
                                    {t.ADD} / {t.UPDATE}
                                </Button>
                            </Form.Item>
                        )}
                        <Form.Item>
                            <Button type="primary" onClick={refreshTopicList}>
                                {t.REFRESH}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <br />
                <div>
                    <div className="row">
                        <Table
                            bordered
                            dataSource={filteredTopicList.map((fTopic, index) => ({ key: index, fTopic }))}
                            columns={columns}
                            pagination={{
                                current: paginationConf.current,
                                pageSize: paginationConf.pageSize,
                                total: filteredTopicList.length,
                                onChange: paginationConf.onChange,
                            }}
                            rowKey="key"
                        />
                    </div>
                </div>
            </div>

            {/* Modals/Dialogs */}
            <ResetOffsetResultDialog
                visible={isResetOffsetResultModalVisible}
                onClose={() => setIsResetOffsetResultModalVisible(false)}
                result={resetOffsetResultData}
                t={t}
            />
            <SendResultDialog
                visible={isSendResultModalVisible}
                onClose={() => setIsSendResultModalVisible(false)}
                result={sendResultData}
                t={t}
            />
            <TopicModifyDialog
                visible={isAddUpdateTopicModalVisible}
                onClose={closeAddUpdateDialog}
                initialData={topicModifyData}
                bIsUpdate={isUpdateMode}
                writeOperationEnabled={writeOperationEnabled}
                allClusterNameList={allClusterNameList}
                allBrokerNameList={allBrokerNameList}
                allMessageTypeList={allMessageTypeList}
                onSubmit={postTopicRequest}
                t={t}
            />
            <ConsumerViewDialog
                visible={isConsumerViewModalVisible}
                onClose={() => setIsConsumerViewModalVisible(false)}
                topic={currentTopicForDialogs}
                consumerData={consumerData}
                consumerGroupCount={allConsumerGroupList.length}
                t={t}
            />
            <ConsumerResetOffsetDialog
                visible={isConsumerResetOffsetModalVisible}
                onClose={() => setIsConsumerResetOffsetModalVisible(false)}
                topic={currentTopicForDialogs}
                allConsumerGroupList={allConsumerGroupList}
                t={t}
            />
            <SkipMessageAccumulateDialog
                visible={isSkipMessageAccumulateModalVisible}
                onClose={() => setIsSkipMessageAccumulateModalVisible(false)}
                topic={currentTopicForDialogs}
                allConsumerGroupList={allConsumerGroupList}
                t={t}
            />
            <StatsViewDialog
                visible={isStatsViewModalVisible}
                onClose={() => setIsStatsViewModalVisible(false)}
                topic={currentTopicForDialogs}
                statsData={statsData}
                t={t}
            />
            <RouterViewDialog
                visible={isRouterViewModalVisible}
                onClose={() => setIsRouterViewModalVisible(false)}
                topic={currentTopicForDialogs}
                routeData={routeData}
                t={t}
            />
            <SendTopicMessageDialog
                visible={isSendTopicMessageModalVisible}
                onClose={() => setIsSendTopicMessageModalVisible(false)}
                topic={currentTopicForDialogs}
                sendTopicMessageData={sendTopicMessageData}
                setSendTopicMessageData={setSendTopicMessageData}
                t={t}
            />
        </div>
    );
};

// --- Dialog Components ---

const ResetOffsetResultDialog = ({ visible, onClose, result, t }) => {
    return (
        <Modal
            title="ResetResult"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            {result && Object.entries(result).map(([groupName, groupData]) => (
                <div key={groupName} style={{ marginBottom: '16px', border: '1px solid #f0f0f0', padding: '10px' }}>
                    <Table
                        dataSource={[{ groupName, status: groupData.status }]}
                        columns={[
                            { title: 'GroupName', dataIndex: 'groupName', key: 'groupName' },
                            { title: 'State', dataIndex: 'status', key: 'status' },
                        ]}
                        pagination={false}
                        rowKey="groupName"
                        size="small"
                        bordered
                    />
                    {groupData.rollbackStatsList === null ? (
                        <div>You Should Check It Yourself</div>
                    ) : (
                        <Table
                            dataSource={groupData.rollbackStatsList.map((item, index) => ({ key: index, item }))}
                            columns={[{ dataIndex: 'item', key: 'item' }]}
                            pagination={false}
                            rowKey="key"
                            size="small"
                            bordered
                            showHeader={false}
                        />
                    )}
                </div>
            ))}
        </Modal>
    );
};

const SendResultDialog = ({ visible, onClose, result, t }) => {
    return (
        <Modal
            title="SendResult"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form layout="horizontal">
                <Table
                    bordered
                    dataSource={result ? Object.entries(result).map(([key, value], index) => ({ key: index, label: key, value: String(value) })) : []}
                    columns={[
                        { dataIndex: 'label', key: 'label' },
                        { dataIndex: 'value', key: 'value' },
                    ]}
                    pagination={false}
                    showHeader={false}
                    rowKey="key"
                    size="small"
                />
            </Form>
        </Modal>
    );
};

const TopicModifyDialog = ({
                               visible,
                               onClose,
                               initialData,
                               bIsUpdate,
                               writeOperationEnabled,
                               allClusterNameList,
                               allBrokerNameList,
                               allMessageTypeList,
                               onSubmit,
                               t
                           }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [visible, initialData, form]);

    const handleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                onSubmit(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={t.TOPIC_CHANGE}
            open={visible}
            onCancel={onClose}
            footer={[
                !initialData.sysFlag && writeOperationEnabled && (
                    <Button key="commit" type="primary" onClick={handleFormSubmit}>
                        {t.COMMIT}
                    </Button>
                ),
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                {!bIsUpdate && (
                    <Form.Item label={t.CLUSTER_NAME} name="clusterNameList">
                        <Select
                            mode="multiple"
                            placeholder={t.SELECT_CLUSTER_NAME}
                            options={allClusterNameList.map(name => ({ value: name, label: name }))}
                        />
                    </Form.Item>
                )}
                <Form.Item label={t.BROKER_NAME} name="brokerNameList">
                    <Select
                        mode="multiple"
                        disabled={bIsUpdate}
                        placeholder={t.SELECT_BROKER_NAME}
                        options={allBrokerNameList.map(name => ({ value: name, label: name }))}
                    />
                </Form.Item>
                <Form.Item
                    label={t.TOPIC_NAME}
                    name="topicName"
                    rules={[{ required: true, message: `${t.TOPIC_NAME}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={bIsUpdate} />
                </Form.Item>
                <Form.Item label={t.MESSAGE_TYPE} name="messageType">
                    <Select
                        disabled={bIsUpdate}
                        options={Object.entries(allMessageTypeList).map(([key, value]) => ({
                            value: key,
                            label: value,
                            disabled: key === 'UNSPECIFIED' // As per original ng-options disable logic
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label={t.WRITE_QUEUE_NUMS}
                    name="writeQueueNums"
                    rules={[{ required: true, message: `${t.WRITE_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} />
                </Form.Item>
                <Form.Item
                    label={t.READ_QUEUE_NUMS}
                    name="readQueueNums"
                    rules={[{ required: true, message: `${t.READ_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} />
                </Form.Item>
                <Form.Item
                    label={t.PERM}
                    name="perm"
                    rules={[{ required: true, message: `${t.PERM}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} />
                </Form.Item>
            </Form>
        </Modal>
    );
};


const ConsumerViewDialog = ({ visible, onClose, topic, consumerData, consumerGroupCount, t }) => {
    const columns = [
        { title: t.BROKER, dataIndex: 'brokerName', key: 'brokerName', align: 'center' },
        { title: t.QUEUE, dataIndex: 'queueId', key: 'queueId', align: 'center' },
        { title: t.CONSUMER_CLIENT, dataIndex: 'clientInfo', key: 'clientInfo', align: 'center' },
        { title: t.BROKER_OFFSET, dataIndex: 'brokerOffset', key: 'brokerOffset', align: 'center' },
        { title: t.CONSUMER_OFFSET, dataIndex: 'consumerOffset', key: 'consumerOffset', align: 'center' },
        {
            title: t.DIFF_TOTAL,
            dataIndex: 'diffTotal',
            key: 'diffTotal',
            align: 'center',
            render: (_, record) => record.brokerOffset - record.consumerOffset,
        },
        {
            title: t.LAST_TIME_STAMP,
            dataIndex: 'lastTimestamp',
            key: 'lastTimestamp',
            align: 'center',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    return (
        <Modal
            title={`${topic} ${t.SUBSCRIPTION_GROUP}`}
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            {consumerGroupCount === 0 ? (
                <div>{t.NO_DATA} {t.SUBSCRIPTION_GROUP}</div>
            ) : (
                consumerData && Object.entries(consumerData).map(([consumerGroup, consumeDetail]) => (
                    <div key={consumerGroup} style={{ marginBottom: '24px' }}>
                        <Table
                            bordered
                            pagination={false}
                            showHeader={false}
                            dataSource={[{ consumerGroup, diffTotal: consumeDetail.diffTotal, lastTimestamp: consumeDetail.lastTimestamp }]}
                            columns={[
                                { title: t.SUBSCRIPTION_GROUP, dataIndex: 'consumerGroup', key: 'consumerGroup' },
                                { title: t.DELAY, dataIndex: 'diffTotal', key: 'diffTotal' },
                                {
                                    title: t.LAST_CONSUME_TIME,
                                    dataIndex: 'lastTimestamp',
                                    key: 'lastTimestamp',
                                    render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
                                },
                            ]}
                            rowKey="consumerGroup"
                            size="small"
                            style={{ marginBottom: '12px' }}
                        />
                        <Table
                            bordered
                            pagination={false}
                            dataSource={consumeDetail.queueStatInfoList}
                            columns={columns}
                            rowKey={(record, index) => `${record.brokerName}-${record.queueId}-${index}`}
                            size="small"
                        />
                    </div>
                ))
            )}
        </Modal>
    );
};

const ConsumerResetOffsetDialog = ({ visible, onClose, topic, allConsumerGroupList, t }) => {
    const [form] = Form.useForm();
    const [selectedConsumerGroup, setSelectedConsumerGroup] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        if (!visible) {
            setSelectedConsumerGroup([]);
            setSelectedTime(null);
            form.resetFields();
        }
    }, [visible, form]);

    const resetOffset = () => {
        if (!selectedConsumerGroup.length || !selectedTime) {
            message.error(t.PLEASE_SELECT_GROUP_AND_TIME); // Assuming you have this translation key
            return;
        }
        console.log(`Resetting offset for topic: ${topic}, groups: ${selectedConsumerGroup}, time: ${selectedTime.format('YYYY-MM-DD HH:mm:ss')}`);
        // Simulate API call and then show result dialog
        const mockResult = {};
        selectedConsumerGroup.forEach(group => {
            mockResult[group] = {
                status: 'SUCCESS', // or 'FAILED'
                rollbackStatsList: ['Mock Stat 1', 'Mock Stat 2'] // or null
            };
        });
        message.success(t.RESET_OFFSET_SUCCESS);
        // In a real app, you'd trigger showing the ResetOffsetResultDialog with mockResult
        onClose();
    };

    return (
        <Modal
            title={`${topic} ${t.RESET_OFFSET}`}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="reset" type="primary" onClick={resetOffset}>
                    {t.RESET}
                </Button>,
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label={t.SUBSCRIPTION_GROUP} required>
                    <Select
                        mode="multiple"
                        placeholder={t.SELECT_CONSUMER_GROUP}
                        value={selectedConsumerGroup}
                        onChange={setSelectedConsumerGroup}
                        options={allConsumerGroupList.map(group => ({ value: group, label: group }))}
                    />
                </Form.Item>
                <Form.Item label={t.TIME} required>
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={selectedTime}
                        onChange={setSelectedTime}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const SkipMessageAccumulateDialog = ({ visible, onClose, topic, allConsumerGroupList, t }) => {
    const [form] = Form.useForm();
    const [selectedConsumerGroup, setSelectedConsumerGroup] = useState([]);

    useEffect(() => {
        if (!visible) {
            setSelectedConsumerGroup([]);
            form.resetFields();
        }
    }, [visible, form]);

    const skipAccumulate = () => {
        if (!selectedConsumerGroup.length) {
            message.error(t.PLEASE_SELECT_GROUP); // Assuming you have this translation key
            return;
        }
        console.log(`Skipping message accumulate for topic: ${topic}, groups: ${selectedConsumerGroup}`);
        // Implement API call
        message.success(t.SKIP_MESSAGE_ACCUMULATE_SUCCESS);
        onClose();
    };

    return (
        <Modal
            title={`${topic} ${t.SKIP_MESSAGE_ACCUMULATE}`}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="commit" type="primary" onClick={skipAccumulate}>
                    {t.COMMIT}
                </Button>,
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label={t.SUBSCRIPTION_GROUP} required>
                    <Select
                        mode="multiple"
                        placeholder={t.SELECT_CONSUMER_GROUP}
                        value={selectedConsumerGroup}
                        onChange={setSelectedConsumerGroup}
                        options={allConsumerGroupList.map(group => ({ value: group, label: group }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const StatsViewDialog = ({ visible, onClose, topic, statsData, t }) => {
    const columns = [
        { title: t.QUEUE, dataIndex: 'queue', key: 'queue', align: 'center' },
        { title: t.MIN_OFFSET, dataIndex: 'minOffset', key: 'minOffset', align: 'center' },
        { title: t.MAX_OFFSET, dataIndex: 'maxOffset', key: 'maxOffset', align: 'center' },
        {
            title: t.LAST_UPDATE_TIME_STAMP,
            dataIndex: 'lastUpdateTimestamp',
            key: 'lastUpdateTimestamp',
            align: 'center',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    const dataSource = statsData?.offsetTable ? Object.entries(statsData.offsetTable).map(([queue, info]) => ({
        key: queue,
        queue: queue,
        ...info,
    })) : [];

    return (
        <Modal
            title={`[${topic}]${t.STATUS}`}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey="key"
                size="small"
            />
        </Modal>
    );
};

const RouterViewDialog = ({ visible, onClose, topic, routeData, t }) => {
    return (
        <Modal
            title={`${topic}${t.ROUTER}`}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <div className="limit_height">
                <table className="table table-bordered table-hover" style={{ width: '100%' }}>
                    <tbody>
                    <tr>
                        <td>brokerDatas:</td>
                        <td>
                            {routeData?.brokerDatas?.map((item, index) => (
                                <table key={index} className="table table-bordered table-hover" style={{ width: '100%', marginBottom: '10px' }}>
                                    <tbody>
                                    <tr>
                                        <td>broker:</td>
                                        <td>{item.brokerName}</td>
                                    </tr>
                                    <tr>
                                        <td>brokerAddrs:</td>
                                        <td>
                                            <table className="table table-bordered table-hover" style={{ width: '100%' }}>
                                                <tbody>
                                                {item.brokerAddrs && Object.entries(item.brokerAddrs).map(([idx, address]) => (
                                                    <tr key={idx}>
                                                        <td>{idx}</td>
                                                        <td>{address}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t.QUEUE_DATAS}</td>
                        <td>
                            {routeData?.queueDatas?.map((item, index) => (
                                <table key={index} className="table table-bordered table-hover" style={{ width: '100%', marginBottom: '10px' }}>
                                    <tbody>
                                    <tr>
                                        <td>{t.BROKER_NAME}</td>
                                        <td>{item.brokerName}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.READ_QUEUE_NUMS}</td>
                                        <td>{item.readQueueNums}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.WRITE_QUEUE_NUMS}</td>
                                        <td>{item.writeQueueNums}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.PERM}</td>
                                        <td>{item.perm}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            ))}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

const SendTopicMessageDialog = ({ visible, onClose, topic, sendTopicMessageData, setSendTopicMessageData, t }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                ...sendTopicMessageData,
                topic: topic, // Ensure topic is always set correctly on open
            });
        } else {
            form.resetFields();
        }
    }, [visible, sendTopicMessageData, topic, form]);

    const handleSend = () => {
        form.validateFields()
            .then(values => {
                console.log('Sending message:', values);
                // Implement API call to send message
                message.success(t.MESSAGE_SENT_SUCCESSFULLY);
                // In a real application, you might show the SendResultDialog here
                onClose();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
                message.error(t.PLEASE_CHECK_YOUR_INPUT); // Generic error message
            });
    };

    return (
        <Modal
            title={`${t.SEND}[${topic}]${t.MESSAGE}`}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="commit" type="primary" onClick={handleSend}>
                    {t.COMMIT}
                </Button>,
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label={t.TOPIC} name="topic">
                    <Input disabled />
                </Form.Item>
                <Form.Item label={t.TAG} name="tag">
                    <Input />
                </Form.Item>
                <Form.Item label={t.KEY} name="key">
                    <Input />
                </Form.Item>
                <Form.Item label={t.MESSAGE_BODY} name="messageBody">
                    <Input.TextArea
                        style={{ maxHeight: '200px', minHeight: '200px', resize: 'none' }}
                        rows={8}
                    />
                </Form.Item>
                <Form.Item label={t.ENABLE_MESSAGE_TRACE} name="traceEnabled" valuePropName="checked">
                    <Checkbox />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeployHistoryList;
