import moment from "moment/moment";
import {Button, Modal, Table} from "antd";
import React from "react";

const StatsViewDialog = ({ visible, onClose, topic, statsData, t }) => {
    const columns = [
        { title: t.QUEUE, dataIndex: 'queue', key: 'queue', align: 'center' },
        { title: t.MIN_OFFSET, dataIndex: 'minOffset', key: 'minOffset', align: 'center' },
        { title: t.MAX_OFFSET, dataIndex: 'maxOffset', key: 'maxOffset', align: 'center' },
        {
            title: t.LAST_UPDATE_TIME_STAMP,
            dataIndex: 'lastUpdateTimestamp',
            key: 'lastUpdateTimestamp',
            align: 'center',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    const dataSource = statsData?.offsetTable ? Object.entries(statsData.offsetTable).map(([queue, info]) => ({
        key: queue,
        queue: queue,
        ...info,
    })) : [];

    return (
        <Modal
            title={`[${topic}]${t.STATUS}`}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t.CLOSE}
                </Button>,
            ]}
        >
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey="key"
                size="small"
            />
        </Modal>
    );
};

export default StatsViewDialog;
