import {Button, Modal, Table} from "antd";
import React from "react";

const ResetOffsetResultDialog = ({ visible, onClose, result, t }) => {
    return (
        <Modal
            title="ResetResult"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            {result && Object.entries(result).map(([groupName, groupData]) => (
                <div key={groupName} style={{ marginBottom: '16px', border: '1px solid #f0f0f0', padding: '10px' }}>
                    <Table
                        dataSource={[{ groupName, status: groupData.status }]}
                        columns={[
                            { title: 'GroupName', dataIndex: 'groupName', key: 'groupName' },
                            { title: 'State', dataIndex: 'status', key: 'status' },
                        ]}
                        pagination={false}
                        rowKey="groupName"
                        size="small"
                        bordered
                    />
                    {groupData.rollbackStatsList === null ? (
                        <div>You Should Check It Yourself</div>
                    ) : (
                        <Table
                            dataSource={groupData.rollbackStatsList.map((item, index) => ({ key: index, item }))}
                            columns={[{ dataIndex: 'item', key: 'item' }]}
                            pagination={false}
                            rowKey="key"
                            size="small"
                            bordered
                            showHeader={false}
                        />
                    )}
                </div>
            ))}
        </Modal>
    );
};

export default ResetOffsetResultDialog;
