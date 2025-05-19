import React from 'react';
import { Modal, Table, Typography, Space } from 'antd';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const { Text } = Typography;

const ClientInfoDialog = ({ visible, onCancel, ngDialogData }) => {
    const { t } = useLanguage();

    const connectionColumns = [
        { title: 'ClientId', dataIndex: 'clientId', key: 'clientId', align: 'center' },
        { title: 'ClientAddr', dataIndex: 'clientAddr', key: 'clientAddr', align: 'center' },
        { title: 'Language', dataIndex: 'language', key: 'language', align: 'center' },
        { title: 'Version', dataIndex: 'versionDesc', key: 'versionDesc', align: 'center' },
    ];

    const subscriptionColumns = [
        { title: 'Topic', dataIndex: 'topic', key: 'topic', align: 'center' },
        { title: 'SubExpression', dataIndex: 'subString', key: 'subString', align: 'center' },
    ];

    const connectionSetData = ngDialogData?.data?.connectionSet || [];
    const subscriptionTableData = ngDialogData?.data?.subscriptionTable
        ? Object.entries(ngDialogData.data.subscriptionTable).map(([topic, detail]) => ({
            topic,
            subString: detail.subString,
        }))
        : [];

    return (
        <Modal
            title={`[${ngDialogData?.consumerGroupName}]${t('CLIENT')}`}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t('CLOSE')}
                </Button>,
            ]}
            width="70%"
        >
            <Table
                columns={connectionColumns}
                dataSource={connectionSetData}
                rowKey="clientId"
                bordered
                pagination={false}
                size="small"
                title={() => 'Connections:'}
                style={{ marginBottom: '20px' }}
            />
            <Text strong>Below is subscription:</Text>
            <Table
                columns={subscriptionColumns}
                dataSource={subscriptionTableData}
                rowKey="topic"
                bordered
                pagination={false}
                size="small"
                style={{ marginBottom: '20px' }}
            />
            <Space direction="vertical">
                <Text>ConsumeType: {ngDialogData?.data?.consumeType}</Text>
                <Text>MessageModel: {ngDialogData?.data?.messageModel}</Text>
                <Text>ConsumeFromWhere: {ngDialogData?.data?.consumeFromWhere}</Text>
            </Space>
        </Modal>
    );
};

export default ClientInfoDialog;
