import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";

const TopicModifyDialog = ({
                               visible,
                               onClose,
                               initialData,
                               bIsUpdate,
                               writeOperationEnabled,
                               allClusterNameList,
                               allBrokerNameList,
                               onSubmit,
                               onInputChange,
                               t,
                           }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && initialData) {
            console.log("Setting form values:", initialData);
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [visible, initialData, form]);

    const handleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                // *** Modification Start ***
                const updatedValues = { ...values };
                if (!updatedValues.clusterNameList || updatedValues.clusterNameList.length === 0) {
                    updatedValues.clusterNameList = allClusterNameList;
                }
                if (!updatedValues.brokerNameList || updatedValues.brokerNameList.length === 0) {
                    updatedValues.brokerNameList = allBrokerNameList;
                }
                onSubmit(updatedValues);
                // *** Modification End ***
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const messageTypeOptions = [ // 定义消息类型选项
        { value: 'TRANSACTION', label: 'TRANSACTION' },
        { value: 'FIFO', label: 'FIFO' },
        { value: 'DELAY', label: 'DELAY' },
        { value: 'NORMAL', label: 'NORMAL' },
    ];

    return (
        <Modal
            title={t.TOPIC_CHANGE}
            open={visible}
            onCancel={onClose}
            footer={[
                !initialData.sysFlag && writeOperationEnabled && (
                    <Button key="commit" type="primary" onClick={handleFormSubmit}>
                        {t.COMMIT}
                    </Button>
                ),
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                <Form.Item label={t.CLUSTER_NAME} name="clusterNameList">
                    <Select
                        mode="multiple"
                        disabled={bIsUpdate}
                        placeholder={t.SELECT_CLUSTER_NAME}
                        options={allClusterNameList.map(name => ({ value: name, label: name }))}
                    />
                </Form.Item>
                <Form.Item label="BROKER_NAME" name="brokerNameList">
                    <Select
                        mode="multiple"
                        disabled={bIsUpdate}
                        placeholder={t.SELECT_BROKER_NAME}
                        options={allBrokerNameList.map(name => ({ value: name, label: name }))}
                    />
                </Form.Item>
                <Form.Item
                    label={t.TOPIC_NAME}
                    name="topicName"
                    defaultValue={initialData.topicName}
                    rules={[{ required: true, message: `${t.TOPIC_NAME}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input
                        disabled={bIsUpdate}
                        onChange={onInputChange}
                    />
                </Form.Item>
                <Form.Item label={t.MESSAGE_TYPE} name="messageType">
                    <Select
                        disabled={bIsUpdate}
                        options={messageTypeOptions}
                        defaultValue="NORMAL"
                    />
                </Form.Item>
                <Form.Item
                    label={t.WRITE_QUEUE_NUMS}
                    name="writeQueueNums"
                    rules={[{ required: true, message: `${t.WRITE_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input
                        disabled={!writeOperationEnabled}
                        onChange={onInputChange}
                    />
                </Form.Item>
                <Form.Item
                    label={t.READ_QUEUE_NUMS}
                    name="readQueueNums"
                    rules={[{ required: true, message: `${t.READ_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input
                        disabled={!writeOperationEnabled}
                        onChange={onInputChange}
                    />
                </Form.Item>
                <Form.Item
                    label={t.PERM}
                    name="perm"
                    rules={[{ required: true, message: `${t.PERM}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input
                        disabled={!writeOperationEnabled}
                        onChange={onInputChange}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TopicModifyDialog;
