import {Button, Checkbox, Form, Input, message, Modal} from "antd";
import React, {useEffect} from "react";
import {remoteApi} from "../../api/remoteApi/remoteApi";

const SendTopicMessageDialog = ({
                                    visible,
                                    onClose,
                                    topic,
                                    setSendResultData,
                                    setIsSendResultModalVisible,
                                    setIsSendTopicMessageModalVisible,
                                    t,
                                }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                topic: topic,
                tag: '',
                key: '',
                messageBody: '',
                traceEnabled: false,
            });
        } else {
            form.resetFields();
        }
    }, [visible, topic, form]);

    const handleSendTopicMessage = async () => {
        try {
            const values = await form.validateFields(); // 👈 从表单获取最新值
            const result = await remoteApi.sendTopicMessage(values); // 👈 用表单数据发送
            if (result.status === 0) {
                setSendResultData(result.data);
                setIsSendResultModalVisible(true);
                setIsSendTopicMessageModalVisible(false);
            } else {
                message.error(result.errMsg);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            message.error("Failed to send message");
        }
    };

    return (
        <Modal
            title={`${t.SEND}[${topic}]${t.MESSAGE}`}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="commit" type="primary" onClick={handleSendTopicMessage}>
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
                <Form.Item label={t.MESSAGE_BODY} name="messageBody" rules={[{ required: true, message: t.REQUIRED }]}>
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

export default SendTopicMessageDialog;
