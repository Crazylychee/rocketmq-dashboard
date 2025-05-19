import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const ConsumerMonitorDialog = ({ visible, onCancel, ngDialogData }) => {
    const { t } = useLanguage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && ngDialogData?.data) {
            form.setFieldsValue({
                minCount: ngDialogData.data.minCount,
                maxDiffTotal: ngDialogData.data.maxDiffTotal,
            });
        }
    }, [visible, ngDialogData, form]);

    const handleCreateOrUpdateConsumerMonitor = async (values) => {
        setLoading(true);
        console.log("更新消费者监控配置:", values);

        // 假设 API 请求
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("更新成功:", values);
            notification.success({
                message: t.SUCCESS,
                description: t.MONITOR_CONFIG_UPDATE_SUCCESS,
            });
            onCancel();
        } catch (error) {
            console.error("更新失败:", error);
            notification.error({
                message: t.ERROR,
                description: t.MONITOR_CONFIG_UPDATE_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`[${ngDialogData?.consumerGroupName}]Monitor`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width="40%"
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={handleCreateOrUpdateConsumerMonitor}
            >
                <Form.Item label="minCount" name="minCount" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={loading} />
                </Form.Item>
                <Form.Item label="maxDiffTotal" name="maxDiffTotal" rules={[{ required: true, message: t.REQUIRED_FIELD_ERROR }]}>
                    <Input disabled={loading} />
                </Form.Item>
                <div style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                        {t.UPDATE}
                    </Button>
                    <Button onClick={onCancel} disabled={loading}>
                        {t.CLOSE}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ConsumerMonitorDialog;
