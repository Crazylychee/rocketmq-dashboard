import React from 'react';
import { Modal, Table, Typography, Button } from 'antd';
import moment from 'moment'; // 用于日期格式化
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const { Text } = Typography;

const ConsumerTopicViewDialog = ({ visible, onCancel, ngDialogData, consumerRunningInfo }) => {
    const { t } = useLanguage();

    const topicSummaryColumns = [
        { title: t.TOPIC, dataIndex: 'topic', key: 'topic', width: '33%' },
        { title: t.DELAY, dataIndex: 'diffTotal', key: 'diffTotal', width: '33%' },
        {
            title: t.LAST_CONSUME_TIME,
            dataIndex: 'lastTimestamp',
            key: 'lastTimestamp',
            width: '34%',
            render: (timestamp) => (timestamp === 0 ? 'N/A' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')),
        },
    ];

    const queueStatColumns = [
        { title: 'broker', dataIndex: 'brokerName', key: 'brokerName', align: 'center' },
        { title: 'queue', dataIndex: 'queueId', key: 'queueId', align: 'center' },
        {
            title: 'consumerClient',
            dataIndex: 'clientInfo',
            key: 'clientInfo',
            align: 'center',
            render: (text, record) => (
                <Button type="link" onClick={() => consumerRunningInfo(ngDialogData.consumerGroupName, record.clientInfo, false)}>
                    {text}
                </Button>
            ),
        },
        { title: 'brokerOffset', dataIndex: 'brokerOffset', key: 'brokerOffset', align: 'center' },
        { title: 'consumerOffset', dataIndex: 'consumerOffset', key: 'consumerOffset', align: 'center' },
        {
            title: 'diffTotal',
            dataIndex: 'diffTotal',
            key: 'diffTotal',
            align: 'center',
            render: (_, record) => record.brokerOffset - record.consumerOffset,
        },
        {
            title: 'lastTimestamp',
            dataIndex: 'lastTimestamp',
            key: 'lastTimestamp',
            align: 'center',
            render: (timestamp) => (timestamp === 0 ? 'N/A' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')),
        },
    ];

    return (
        <Modal
            title={`[${ngDialogData?.consumerGroupName}]${t.CONSUME_DETAIL}`}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t.CLOSE}
                </Button>,
            ]}
            width="80%"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
            {ngDialogData?.data?.map((consumeDetail, index) => (
                <div key={index} style={{ marginBottom: '20px', border: '1px solid #f0f0f0', padding: '10px' }}>
                    <Table
                        columns={topicSummaryColumns}
                        dataSource={[{ ...consumeDetail, key: consumeDetail.topic }]}
                        pagination={false}
                        bordered
                        size="small"
                        showHeader={false} // 隐藏表头，因为是summary
                        style={{ marginBottom: '10px' }}
                    />
                    <Table
                        columns={queueStatColumns}
                        dataSource={consumeDetail.queueStatInfoList}
                        rowKey={(record, idx) => `${record.brokerName}-${record.queueId}-${idx}`}
                        pagination={false}
                        bordered
                        size="small"
                    />
                </div>
            ))}
        </Modal>
    );
};

export default ConsumerTopicViewDialog;
