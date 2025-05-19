import {Button, Form, message, Modal, Select} from "antd";
import React, {useEffect, useState} from "react";

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

export default SkipMessageAccumulateDialog;
