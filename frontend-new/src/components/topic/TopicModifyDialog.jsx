// TopicModifyDialog.js
import { Button, Modal } from "antd";
import React from "react";
import TopicSingleModifyForm from './TopicSingleModifyForm';

const TopicModifyDialog = ({
                               visible,
                               onClose,
                               initialData,
                               bIsUpdate,
                               writeOperationEnabled,
                               allClusterNameList,
                               allBrokerNameList,
                               onSubmit,
                               t,
                           }) => {

    return (
        <Modal
            title={bIsUpdate ? t.TOPIC_CHANGE : t.TOPIC_ADD}
            open={visible}
            onCancel={onClose}
            width={700}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
            Style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
            {initialData.map((data, index) => (
                <TopicSingleModifyForm
                    key={index}
                    initialData={data}
                    bIsUpdate={bIsUpdate}
                    writeOperationEnabled={writeOperationEnabled}
                    allClusterNameList={allClusterNameList}
                    allBrokerNameList={allBrokerNameList}
                    onSubmit={onSubmit}
                    formIndex={index}
                    t={t}
                />
            ))}
        </Modal>
    );
};

export default TopicModifyDialog;
