import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin } from 'antd';
import { remoteApi } from '../../api/remoteApi/remoteApi';
import { useLanguage } from '../../i18n/LanguageContext';

const ConsumerDetailModal = ({ visible, group, address, onCancel }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!visible) return;

            setLoading(true);
            try {
                const response = await remoteApi.queryTopicByConsumer(group, address);
                if (response.status === 0) {
                    setDetails(response.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [visible, group, address]);

    const queueColumns = [
        { title: 'Broker', dataIndex: 'brokerName' },
        { title: 'Queue', dataIndex: 'queueId' },
        { title: 'BrokerOffset', dataIndex: 'brokerOffset' },
        { title: 'ConsumerOffset', dataIndex: 'consumerOffset' },
        { title: 'DiffTotal', dataIndex: 'diffTotal' },
        { title: 'LastTimestamp', dataIndex: 'lastTimestamp' },
    ];

    return (
        <Modal
            title={`[${group}]${t.CONSUME_DETAIL}`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={1200}
        >
            <Spin spinning={loading}>
                {details.map((consumeDetail, index) => (
                    <div key={index}>
                        <Table
                            columns={queueColumns}
                            dataSource={consumeDetail.queueStatInfoList}
                            rowKey="queueId"
                            pagination={false}
                        />
                    </div>
                ))}
            </Spin>
        </Modal>
    );
};

export default ConsumerDetailModal;
