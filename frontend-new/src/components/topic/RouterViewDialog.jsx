import { Button, Modal, Table } from "antd";
import React from "react";

const RouterViewDialog = ({ visible, onClose, topic, routeData, t }) => {
    const brokerColumns = [
        {
            title: 'Broker',
            dataIndex: 'brokerName',
            key: 'brokerName',
        },
        {
            title: 'Broker Addrs',
            key: 'brokerAddrs',
            render: (_, record) => (
                <Table
                    dataSource={Object.entries(record.brokerAddrs || []).map(([key, value]) => ({ key, idx: key, address: value }))}
                    columns={[
                        { title: 'Index', dataIndex: 'idx', key: 'idx' },
                        { title: 'Address', dataIndex: 'address', key: 'address' },
                    ]}
                    pagination={false}
                    bordered
                    size="small"
                />
            ),
        },
    ];

    const queueColumns = [
        {
            title: t.BROKER_NAME,
            dataIndex: 'brokerName',
            key: 'brokerName',
        },
        {
            title: t.READ_QUEUE_NUMS,
            dataIndex: 'readQueueNums',
            key: 'readQueueNums',
        },
        {
            title: t.WRITE_QUEUE_NUMS,
            dataIndex: 'writeQueueNums',
            key: 'writeQueueNums',
        },
        {
            title: t.PERM,
            dataIndex: 'perm',
            key: 'perm',
        },
    ];

    return (
        <Modal
            title={`${topic}${t.ROUTER}`}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <div className="limit_height">
                <div>
                    <h3>Broker Datas:</h3>
                    {routeData?.brokerDatas?.map((item, index) => (
                        <div key={index} style={{ marginBottom: '15px', border: '1px solid #d9d9d9', padding: '10px' }}>
                            <Table
                                dataSource={[item]}
                                columns={brokerColumns}
                                pagination={false}
                                bordered
                                size="small"
                            />
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '20px' }}>
                    <h3>{t.QUEUE_DATAS}:</h3>
                    <Table
                        dataSource={routeData?.queueDatas || []}
                        columns={queueColumns}
                        pagination={false}
                        bordered
                        size="small"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default RouterViewDialog;
