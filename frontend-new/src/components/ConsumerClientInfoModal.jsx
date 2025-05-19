import React from 'react';
import {Button, Modal, Table} from 'antd';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const ConsumerClientInfoModal = ({ visible, onCancel, consumerClientInfo, clientId }) => {
    const { t } = useLanguage();

    const propertiesColumns = [
        { title: 'Key', dataIndex: 'key', key: 'key', width: '50%', ellipsis: true },
        { title: 'Value', dataIndex: 'value', key: 'value', width: '50%', ellipsis: true },
    ];

    const statusColumns = [
        { title: 'Key', dataIndex: 'key', key: 'key', width: '50%', ellipsis: true },
        { title: 'Value', dataIndex: 'value', key: 'value', width: '50%', ellipsis: true },
    ];

    const propertiesData = consumerClientInfo?.properties
        ? Object.entries(consumerClientInfo.properties).map(([key, value]) => ({ key, value }))
        : [];

    const statusTableData = consumerClientInfo?.statusTable
        ? Object.entries(consumerClientInfo.statusTable).map(([key, value]) => ({ key, value }))
        : [];

    return (
        <Modal
            title={clientId || 'consumerClientInfo'}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t.CLOSE}
                </Button>,
            ]}
            width="80%"
        >
            <h3>Properties:</h3>
            <Table
                dataSource={propertiesData}
                columns={propertiesColumns}
                rowKey="key"
                pagination={false}
                bordered
                size="small"
                style={{ marginBottom: '20px' }}
            />
            <h3>Status Table:</h3>
            <Table
                dataSource={statusTableData}
                columns={statusColumns}
                rowKey="key"
                pagination={false}
                bordered
                size="small"
            />
        </Modal>
    );
};

export default ConsumerClientInfoModal;
