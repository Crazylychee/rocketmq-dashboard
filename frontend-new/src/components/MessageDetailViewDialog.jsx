import React, { useState } from 'react';
import { Form, Input, Button, Table, Typography, Modal } from 'antd';
import moment from 'moment';
import {useLanguage} from "../i18n/LanguageContext";


const { Text, Paragraph } = Typography;

const MessageDetailViewDialog = ({ ngDialogData, resendMessage, showExceptionDesc }) => {
    const { t } = useLanguage();
    const [filterConsumerGroup, setFilterConsumerGroup] = useState('');

    const messageView = ngDialogData?.messageView || {};
    const messageTrackList = ngDialogData?.messageTrackList || [];

    const filteredMessageTrackList = messageTrackList.filter(item =>
        item.consumerGroup.toLowerCase().includes(filterConsumerGroup.toLowerCase())
    );

    const trackColumns = [
        { title: 'consumerGroup', dataIndex: 'consumerGroup', key: 'consumerGroup', align: 'center' },
        { title: 'trackType', dataIndex: 'trackType', key: 'trackType', align: 'center' },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <>
                    <Button
                        type="primary"
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={() => resendMessage(messageView, record.consumerGroup)}
                    >
                        {t.RESEND_MESSAGE}
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => showExceptionDesc(record.exceptionDesc)}
                    >
                        {t.VIEW_EXCEPTION}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Form layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Form.Item label="Message ID:">
                    <Text strong>{messageView.msgId}</Text>
                </Form.Item>
                <Form.Item label="Topic:">
                    <Text strong>{messageView.topic}</Text>
                </Form.Item>
                <Form.Item label="Tag:">
                    <Text strong>{messageView.properties?.TAGS}</Text>
                </Form.Item>
                <Form.Item label="Key:">
                    <Text strong>{messageView.properties?.KEYS}</Text>
                </Form.Item>
                <Form.Item label="Storetime:">
                    <Text strong>{moment(messageView.storeTimestamp).format("YYYY-MM-DD HH:mm:ss")}</Text>
                </Form.Item>
                <Form.Item label="Message body:">
                    <Input.TextArea
                        value={messageView.messageBody}
                        style={{ minHeight: 200, resize: 'none' }}
                        readOnly
                    />
                </Form.Item>
            </Form>

            <Paragraph strong style={{ marginTop: 20, marginBottom: 10, color: '#000' }}>
                messageTrackList:
            </Paragraph>
            <Form layout="inline" style={{ marginBottom: 10 }}>
                <Form.Item label="consumerGroup:">
                    <Input
                        value={filterConsumerGroup}
                        onChange={(e) => setFilterConsumerGroup(e.target.value)}
                    />
                </Form.Item>
            </Form>
            <Table
                columns={trackColumns}
                dataSource={filteredMessageTrackList}
                rowKey="consumerGroup" // 假设consumerGroup唯一
                bordered
                pagination={false}
                size="small"
                locale={{ emptyText: t.NO_MATCH_RESULT }}
            />
        </div>
    );
};

export default MessageDetailViewDialog;
