import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin } from 'antd';
import { remoteApi } from '../../api/remoteApi/remoteApi';
import { useLanguage } from '../../i18n/LanguageContext';

const ClientInfoModal = ({ visible, group, address, onCancel }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [connectionData, setConnectionData] = useState(null);
    const [subscriptionData, setSubscriptionData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!visible) return;

            setLoading(true);
            try {
                const connResponse = await remoteApi.queryConsumerConnection(group, address);
                const topicResponse = await remoteApi.queryTopicByConsumer(group, address);

                if (connResponse.status === 0) setConnectionData(connResponse.data);
                if (topicResponse.status === 0) setSubscriptionData(topicResponse.data);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [visible, group, address]);

    const connectionColumns = [
        { title: 'ClientId', dataIndex: 'clientId' },
        { title: 'ClientAddr', dataIndex: 'clientAddr' },
        { title: 'Language', dataIndex: 'language' },
        { title: 'Version', dataIndex: 'versionDesc' },
    ];

    const subscriptionColumns = [
        { title: 'Topic', dataIndex: 'topic' },
        { title: 'SubExpression', dataIndex: 'subString' },
    ];

    return (
        <Modal
            title={`[${group}]${t.CLIENT}`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Spin spinning={loading}>
                {connectionData && (
                    <>
                        <Table
                            columns={connectionColumns}
                            dataSource={connectionData.connectionSet}
                            rowKey="clientId"
                            pagination={false}
                        />
                        <h4>{t.SUBSCRIPTION}</h4>
                        <Table
                            columns={subscriptionColumns}
                            dataSource={
                                subscriptionData?.subscriptionTable
                                    ? Object.entries(subscriptionData.subscriptionTable).map(([topic, detail]) => ({
                                        topic,
                                        ...detail,
                                    }))
                                    : []
                            }
                            rowKey="topic"
                            pagination={false}
                            locale={{
                                emptyText: loading ? <Spin size="small" /> : t.NO_DATA
                            }}
                        />
                        <p>ConsumeType: {connectionData.consumeType}</p>
                        <p>MessageModel: {connectionData.messageModel}</p>
                    </>
                )}
            </Spin>
        </Modal>
    );
};

export default ClientInfoModal;
