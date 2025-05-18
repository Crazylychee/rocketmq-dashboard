import React from 'react';
import { Form, Input, Typography, Modal } from 'antd';
import moment from 'moment';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const { Text } = Typography;

const DlqMessageDetailViewDialog = ({ ngDialogData }) => {
    const { t } = useLanguage();

    const messageView = ngDialogData?.messageView || {};

    return (
        <div style={{ padding: '20px' }}>
            <Form layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Form.Item label="Message ID:">
                    <Text strong>{messageView.msgId}</Text>
                </Form.Item>
                <Form.Item label="Topic:">
                    <Text strong>{messageView.topic}</Text>
                </Form.Item>
                <Form.Item label="Properties:">
                    <Input.TextArea
                        value={typeof messageView.properties === 'object' ? JSON.stringify(messageView.properties, null, 2) : messageView.properties}
                        style={{ minHeight: 100, resize: 'none' }}
                        readOnly
                    />
                </Form.Item>
                <Form.Item label="ReconsumeTimes:">
                    <Text strong>{messageView.reconsumeTimes}</Text>
                </Form.Item>
                <Form.Item label="Tag:">
                    <Text strong>{messageView.properties?.TAGS}</Text>
                </Form.Item>
                <Form.Item label="Key:">
                    <Text strong>{messageView.properties?.KEYS}</Text>
                </Form.Item>
                <Form.Item label="Storetime:">
                    <Text strong>{moment(messageView.storeTimestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
                </Form.Item>
                <Form.Item label="StoreHost:">
                    <Text strong>{messageView.storeHost}</Text>
                </Form.Item>
                <Form.Item label="Message body:">
                    <Input.TextArea
                        value={messageView.messageBody}
                        style={{ minHeight: 100, resize: 'none' }}
                        readOnly
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export default DlqMessageDetailViewDialog;
