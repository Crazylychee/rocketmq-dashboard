import React, { useState } from 'react';
import { Table, Button, Modal, Select } from 'antd';
import {useLanguage} from "../../i18n/LanguageContext";
// 你 LanguageContext 的路径，根据实际调整

const { Option } = Select;

const Cluster = ({ clusterNames = [], instances = [], onSwitchCluster }) => {
    const { t } = useLanguage();  // 取当前语言文本资源

    const [selectedCluster, setSelectedCluster] = useState('');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [currentDetail, setCurrentDetail] = useState({});
    const [currentConfig, setCurrentConfig] = useState({});
    const [currentBrokerName, setCurrentBrokerName] = useState('');
    const [currentIndex, setCurrentIndex] = useState(null);

    const handleChangeCluster = (value) => {
        setSelectedCluster(value);
        onSwitchCluster?.(value);
    };

    const showDetail = (brokerName, index, detail) => {
        setCurrentBrokerName(brokerName);
        setCurrentIndex(index);
        setCurrentDetail(detail);
        setDetailModalVisible(true);
    };

    const showConfig = (brokerName, index, config) => {
        setCurrentBrokerName(brokerName);
        setCurrentIndex(index);
        setCurrentConfig(config);
        setConfigModalVisible(true);
    };

    const columns = [
        {
            title: t.SPLIT,
            dataIndex: 'split',
            key: 'split',
            align: 'center',
        },
        {
            title: t.NO,
            key: 'no',
            align: 'center',
            render: (_, record) => `${record.index}${record.index === 0 ? `(${t.MASTER})` : `(${t.SLAVE})`}`,
        },
        {
            title: t.ADDRESS,
            dataIndex: 'address',
            key: 'address',
            align: 'center',
        },
        {
            title: t.VERSION,
            dataIndex: 'brokerVersionDesc',
            key: 'version',
            align: 'center',
        },
        {
            title: t.PRO_MSG_TPS,
            dataIndex: 'putTps',
            key: 'putTps',
            align: 'center',
            render: (text) => Number(text.split(' ')[0]).toFixed(2),
        },
        {
            title: t.CUS_MSG_TPS,
            key: 'cusMsgTps',
            align: 'center',
            render: (_, record) => {
                const val = record.getTransferedTps?.trim() ? record.getTransferedTps : record.getTransferredTps;
                return Number(val.split(' ')[0]).toFixed(2);
            },
        },
        {
            title: t.YESTERDAY_PRO_COUNT,
            key: 'yesterdayProCount',
            align: 'center',
            render: (_, record) => record.msgPutTotalTodayMorning - record.msgPutTotalYesterdayMorning,
        },
        {
            title: t.YESTERDAY_CUS_COUNT,
            key: 'yesterdayCusCount',
            align: 'center',
            render: (_, record) => record.msgGetTotalTodayMorning - record.msgGetTotalYesterdayMorning,
        },
        {
            title: t.TODAY_PRO_COUNT,
            key: 'todayProCount',
            align: 'center',
            render: (_, record) => record.msgPutTotalTodayNow - record.msgPutTotalTodayMorning,
        },
        {
            title: t.TODAY_CUS_COUNT,
            key: 'todayCusCount',
            align: 'center',
            render: (_, record) => record.msgGetTotalTodayNow - record.msgGetTotalTodayMorning,
        },
        {
            title: t.OPERATION,
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <>
                    <Button size="small" type="primary" onClick={() => showDetail(record.brokerName, record.index, record.detail || {})} style={{ marginRight: 8 }}>
                        {t.STATUS}
                    </Button>
                    <Button size="small" type="primary" onClick={() => showConfig(record.brokerName, record.index, record.brokerConfig || {})}>
                        {t.CONFIG}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: 8 }}>{t.CLUSTER}:</label>
                <Select
                    style={{ width: 300 }}
                    placeholder={t.SELECT_CLUSTER || "Please select a cluster"}
                    value={selectedCluster}
                    onChange={handleChangeCluster}
                    allowClear
                >
                    {clusterNames.map((name) => (
                        <Option key={name} value={name}>
                            {name}
                        </Option>
                    ))}
                </Select>
            </div>

            <Table
                dataSource={instances}
                columns={columns}
                rowKey={(record) => `${record.brokerName}-${record.index}`}
                pagination={false}
                bordered
                size="middle"
            />

            <Modal
                title={`[${currentBrokerName}][${currentIndex}]`}
                visible={detailModalVisible}
                footer={null}
                onCancel={() => setDetailModalVisible(false)}
                width={800}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                <Table
                    dataSource={Object.entries(currentDetail).map(([key, value]) => ({ key, value }))}
                    columns={[
                        { title: t.KEY || 'Key', dataIndex: 'key', key: 'key' },
                        { title: t.VALUE || 'Value', dataIndex: 'value', key: 'value' },
                    ]}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey="key"
                />
            </Modal>

            <Modal
                title={`[${currentBrokerName}][${currentIndex}]`}
                visible={configModalVisible}
                footer={null}
                onCancel={() => setConfigModalVisible(false)}
                width={800}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                <Table
                    dataSource={Object.entries(currentConfig).map(([key, value]) => ({ key, value }))}
                    columns={[
                        { title: t.KEY || 'Key', dataIndex: 'key', key: 'key' },
                        { title: t.VALUE || 'Value', dataIndex: 'value', key: 'value' },
                    ]}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey="key"
                />
            </Modal>
        </div>
    );
};

export default Cluster;
