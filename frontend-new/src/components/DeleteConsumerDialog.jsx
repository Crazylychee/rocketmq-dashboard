import React, { useState } from 'react';
import { Modal, Select, Button, notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext'; // 根据实际路径调整

const { Option } = Select;

const DeleteConsumerDialog = ({ visible, onCancel, ngDialogData }) => {
    const { t } = useLanguage();
    const [selectedBrokerNameList, setSelectedBrokerNameList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (selectedBrokerNameList.length === 0) {
            notification.warn({
                message: t.WARNING,
                description: t.PLEASE_SELECT_BROKER,
            });
            return;
        }

        setLoading(true);
        console.log(`删除消费者组 ${ngDialogData?.consumerGroupName} 在以下 broker:`, selectedBrokerNameList);

        try {
            // 模拟 API 调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("删除成功");
            notification.success({
                message: t.SUCCESS,
                description: t.DELETE_SUCCESS,
            });
            onCancel();
        } catch (error) {
            console.error("删除失败:", error);
            notification.error({
                message: t.ERROR,
                description: t.DELETE_FAILED,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`[${ngDialogData?.consumerGroupName}]${t.DELETE}`}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="delete" type="primary" danger onClick={handleDelete} loading={loading}>
                    {t.DELETE}
                </Button>,
                <Button key="close" onClick={onCancel} disabled={loading}>
                    {t.CLOSE}
                </Button>,
            ]}
            width="40%"
        >
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '8px' }}>broker:</label>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder={t.SELECT_BROKER_PLACEHOLDER}
                    value={selectedBrokerNameList}
                    onChange={setSelectedBrokerNameList}
                    disabled={loading}
                >
                    {ngDialogData?.allBrokerNameList?.map(item => (
                        <Option key={item} value={item}>
                            {item}
                        </Option>
                    ))}
                </Select>
            </div>
        </Modal>
    );
};

export default DeleteConsumerDialog;
