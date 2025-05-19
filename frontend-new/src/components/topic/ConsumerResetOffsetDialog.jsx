import {Button, DatePicker, Form, message, Modal, Select} from "antd";
import React, {useEffect, useState} from "react";

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

export default ConsumerResetOffsetDialog;
