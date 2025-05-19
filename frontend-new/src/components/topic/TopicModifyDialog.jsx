import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";

const TopicModifyDialog = ({
                               visible,
                               onClose,
                               initialData,
                               bIsUpdate,
                               writeOperationEnabled,
                               allClusterNameList,
                               allBrokerNameList,
                               allMessageTypeList,
                               onSubmit,
                               t
                           }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [visible, initialData, form]);

    const handleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                onSubmit(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

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
                        disabled={bIsUpdate} // 更新模式下禁用
                        placeholder={t.SELECT_CLUSTER_NAME}
                        options={allClusterNameList.map(name => ({ value: name, label: name }))}
                    />
                </Form.Item>
                <Form.Item label={t.BROKER_NAME} name="brokerNameList">
                    <Select
                        mode="multiple"
                        disabled={bIsUpdate} // 更新模式下禁用
                        placeholder={t.SELECT_BROKER_NAME}
                        options={allBrokerNameList.map(name => ({ value: name, label: name }))}
                    />
                </Form.Item>
                <Form.Item
                    label={t.TOPIC_NAME}
                    name="topicName"
                    rules={[{ required: true, message: `${t.TOPIC_NAME}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={bIsUpdate} /> {/* 更新模式下禁用 */}
                </Form.Item>
                <Form.Item label={t.MESSAGE_TYPE} name="messageType">
                    <Select
                        disabled={bIsUpdate} // 更新模式下禁用
                        options={Object.entries(allMessageTypeList).map(([key, value]) => ({
                            value: key,
                            label: value,
                            disabled: key === 'UNSPECIFIED'
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label={t.WRITE_QUEUE_NUMS}
                    name="writeQueueNums"
                    rules={[{ required: true, message: `${t.WRITE_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} /> {/* 仅根据 writeOperationEnabled 禁用 */}
                </Form.Item>
                <Form.Item
                    label={t.READ_QUEUE_NUMS}
                    name="readQueueNums"
                    rules={[{ required: true, message: `${t.READ_QUEUE_NUMS}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} /> {/* 仅根据 writeOperationEnabled 禁用 */}
                </Form.Item>
                <Form.Item
                    label={t.PERM}
                    name="perm"
                    rules={[{ required: true, message: `${t.PERM}${t.CANNOT_BE_EMPTY}` }]}
                >
                    <Input disabled={!writeOperationEnabled} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TopicModifyDialog;
