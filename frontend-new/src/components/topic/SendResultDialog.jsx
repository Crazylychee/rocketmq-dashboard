import {Button, Form, Modal, Table} from "antd";
import React from "react";

const SendResultDialog = ({ visible, onClose, result, t }) => {
    return (
        <Modal
            title="SendResult"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Form layout="horizontal">
                <Table
                    bordered
                    dataSource={
                        result
                            ? Object.entries(result).map(([key, value], index) => ({
                                key: index,
                                label: key,
                                value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
                            }))
                            : []
                    }
                    columns={[
                        { dataIndex: 'label', key: 'label' },
                        {
                            dataIndex: 'value',
                            key: 'value',
                            render: (text) => <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{text}</pre>,
                        },
                    ]}
                    pagination={false}
                    showHeader={false}
                    rowKey="key"
                    size="small"
                />
            </Form>
        </Modal>
    );
};



export default SendResultDialog;
