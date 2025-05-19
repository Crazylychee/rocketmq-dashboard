import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Switch, Button, notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const { Option } = Select;

const ConsumerModifyDialogForV5 = ({ visible, onCancel, ngDialogData }) => {
    const { t } = useLanguage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && ngDialogData?.consumerRequestList && ngDialogData.consumerRequestList.length > 0) {
            const item = ngDialogData.consumerRequestList[0];
            form.setFieldsValue({
                clusterNameList: item.clusterNameList,
                brokerNameList: item.brokerNameList,
                groupName: item.subscriptionGroupConfig.groupName,
                consumeEnable: item.subscriptionGroupConfig.consumeEnable,
                consumeMessageOrderly: item.subscriptionGroupConfig.consumeMessageOrderly, // V5 特有
                consumeBroadcastEnable: item.subscriptionGroupConfig.consumeBroadcastEnable,
                retryQueueNums: item.subscriptionGroupConfig.retryQueueNums,
                brokerId: item.subscriptionGroupConfig.brokerId,
                retryMaxTimes: item.subscriptionGroupConfig.retryMaxTimes,
                whichBrokerWhenConsumeSlowly: item.subscriptionGroupConfig.whichBrokerWhenConsumeSlowly,
            });
        }
    }, [visible, ngDialogData, form]);

    const handlePostConsumerRequest = async (values) => {
        setLoading(true);
        console.log("提交消费者 V5 配置请求:", values);

        const requestBody = {
            ...ngDialogData.consumerRequestList[0],
            clusterNameList: values.clusterNameList,
            brokerNameList: values.brokerNameList,
            subscriptionGroupConfig: {
                ...ngDialogData.consumerRequestList[0].subscriptionGroupConfig,
                groupName: values.groupName,
                consumeEnable: values.consumeEnable,
                consumeMessageOrderly: values.consumeMessageOrderly, // V5 特有
                consumeBroadcastEnable: values.consumeBroadcastEnable,
                retryQueueNums: values.retryQueueNums,
                brokerId: values.brokerId,
                retryMaxTimes: values.retryMaxTimes,
                whichBrokerWhenConsumeSlowly: values.whichBrokerWhenConsumeSlowly,
            }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("提交成功", requestBody);
            notification.success({
                message: t.SUCCESS,
                description: t.CONFIG_UPDATE_SUCCESS,
            });
            onCancel();
        } catch (error) {
            console.error("提交失败:", error);
            notification.error({
                message: t.ERROR,
                description: t.CONFIG_UPDATE_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={t.SUBSCRIPTION_CHANGE}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width="60%"
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={handlePostConsumerRequest}
            >
                <Form.Item label="clusterName" name="clusterNameList" hidden={ngDialogData?.bIsUpdate}>
                    <Select mode="multiple" disabled={loading}>
                        {ngDialogData?.allClusterNameList?.map(name => (
                            <Option key={name} value={name}>{name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="brokerName" name="brokerNameList">
                    <Select mode="multiple" disabled={ngDialogData?.bIsUpdate || loading}>
                        {ngDialogData?.allBrokerNameList?.map(name => (
                            <Option key={name} value={name}>{name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="groupName" name="groupName" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={ngDialogData?.bIsUpdate || loading} />
                </Form.Item>
                <Form.Item label="consumeEnable" name="consumeEnable" valuePropName="checked">
                    <Switch disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <Form.Item label="consumeOrderlyEnable" name="consumeMessageOrderly" valuePropName="checked">
                    <Switch disabled={!ngDialogData?.writeOperationEnabled || loading} />
                    <span style={{ fontSize: '12px', marginLeft: '10px' }}>
                        [Pay Attention: FIFO ConsumerGroup Need Open 'consumeOrderlyEnable' Option]
                    </span>
                </Form.Item>
                <Form.Item label="consumeBroadcastEnable" name="consumeBroadcastEnable" valuePropName="checked">
                    <Switch disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <Form.Item label="retryQueueNums" name="retryQueueNums" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <Form.Item label="brokerId" name="brokerId" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <Form.Item label="retryMaxTimes" name="retryMaxTimes" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <Form.Item label="whichBrokerWhenConsumeSlowly" name="whichBrokerWhenConsumeSlowly" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={!ngDialogData?.writeOperationEnabled || loading} />
                </Form.Item>
                <div style={{ textAlign: 'right' }}>
                    {ngDialogData?.writeOperationEnabled && (
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            {t.COMMIT}
                        </Button>
                    )}
                    <Button onClick={onCancel} disabled={loading}>
                        {t.CLOSE}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ConsumerModifyDialogForV5;
