import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Checkbox, Switch, Spin, Modal, Select } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext'; // 根据实际路径调整

const { Option } = Select;

const ConsumerGroupList = () => {
    const { t } = useLanguage();
    const [filterStr, setFilterStr] = useState('');
    const [filterNormal, setFilterNormal] = useState(true);
    const [filterFIFO, setFilterFIFO] = useState(false);
    const [filterSystem, setFilterSystem] = useState(false);
    const [rmqVersion, setRmqVersion] = useState(true); // 假设rmqVersion是一个状态或prop
    const [writeOperationEnabled, setWriteOperationEnabled] = useState(true); // 假设权限
    const [intervalProcessSwitch, setIntervalProcessSwitch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [consumerGroupShowList, setConsumerGroupShowList] = useState([]); // 实际数据
    const [paginationConf, setPaginationConf] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 假设的数据，你需要从API获取
    useEffect(() => {
        setLoading(true);
        // 模拟API调用
        setTimeout(() => {
            const mockData = [
                {
                    group: 'MyConsumerGroup1',
                    count: 5,
                    version: '4.9.0',
                    consumeType: 'COMPLEX',
                    messageModel: 'CLUSTERING',
                    consumeTps: 120,
                    diffTotal: 1000,
                    updateTime: '2023-05-15 10:00:00',
                    address: '192.168.1.1:9876',
                },
                {
                    group: '%SYS%SystemConsumer',
                    count: 2,
                    version: '4.9.0',
                    consumeType: 'SIMPLE',
                    messageModel: 'BROADCASTING',
                    consumeTps: 50,
                    diffTotal: 200,
                    updateTime: '2023-05-15 11:30:00',
                    address: '192.168.1.2:9876',
                },
                // 更多数据...
            ];
            setConsumerGroupShowList(mockData);
            setPaginationConf(prev => ({ ...prev, total: mockData.length }));
            setLoading(false);
        }, 1000);
    }, []);


    const handleRefreshConsumerData = () => {
        console.log("刷新消费者数据");
        // 这里需要调用实际的API来获取最新数据
    };

    const handleOpenAddDialog = () => {
        console.log("打开添加/更新对话框");
        // 触发打开 Add/Update 对话框的逻辑
    };

    const handleClient = (group, address) => {
        console.log(`查看客户端信息: ${group}, ${address}`);
        // 触发打开客户端信息对话框的逻辑
        Modal.info({
            title: t.CLIENT_INFO,
            content: `Group: ${group}, Address: ${address}`,
            onOk() {},
        });
    };

    const handleDetail = (group, address) => {
        console.log(`查看消费详情: ${group}, ${address}`);
        // 触发打开消费详情对话框的逻辑
        Modal.info({
            title: t.CONSUME_DETAIL,
            content: `Group: ${group}, Address: ${address}`,
            onOk() {},
        });
    };

    const handleUpdateConfigDialog = (group) => {
        console.log(`更新配置: ${group}`);
        // 触发打开配置对话框的逻辑
        Modal.info({
            title: t.CONFIG,
            content: `Group: ${group}`,
            onOk() {},
        });
    };

    const handleDelete = (group) => {
        console.log(`删除消费者组: ${group}`);
        // 触发打开删除对话框的逻辑
        Modal.confirm({
            title: t.DELETE_CONFIRM_TITLE,
            content: `${t.DELETE_CONFIRM_CONTENT} ${group}?`,
            onOk() {
                console.log(`确认删除 ${group}`);
                // 执行删除操作
            },
            onCancel() {},
        });
    };

    const handleRefreshConsumerGroup = (group) => {
        console.log(`刷新消费者组: ${group}`);
        // 刷新单个消费者组数据
    };

    const columns = [
        {
            title: <a onClick={() => console.log('sort by group')}>{t.SUBSCRIPTION_GROUP}</a>,
            dataIndex: 'group',
            key: 'group',
            align: 'center',
            render: (text) => {
                const sysFlag = text.startsWith('%SYS%');
                return (
                    <span style={{ color: sysFlag ? 'red' : '' }}>
                        {sysFlag ? text.substring(5) : text}
                    </span>
                );
            },
        },
        {
            title: <a onClick={() => console.log('sort by count')}>{t.QUANTITY}</a>,
            dataIndex: 'count',
            key: 'count',
            align: 'center',
        },
        {
            title: t.VERSION,
            dataIndex: 'version',
            key: 'version',
            align: 'center',
        },
        {
            title: t.TYPE,
            dataIndex: 'consumeType',
            key: 'consumeType',
            align: 'center',
        },
        {
            title: t.MODE,
            dataIndex: 'messageModel',
            key: 'messageModel',
            align: 'center',
        },
        {
            title: <a onClick={() => console.log('sort by consumeTps')}>TPS</a>,
            dataIndex: 'consumeTps',
            key: 'consumeTps',
            align: 'center',
        },
        {
            title: <a onClick={() => console.log('sort by diffTotal')}>{t.DELAY}</a>,
            dataIndex: 'diffTotal',
            key: 'diffTotal',
            align: 'center',
        },
        {
            title: t.UPDATE_TIME,
            dataIndex: 'updateTime',
            key: 'updateTime',
            align: 'center',
        },
        {
            title: t.OPERATION,
            key: 'operation',
            align: 'left',
            render: (_, record) => {
                const sysFlag = record.group.startsWith('%SYS%');
                return (
                    <>
                        <Button
                            type="primary"
                            size="small"
                            style={{ marginRight: 8, marginBottom: 8 }}
                            onClick={() => handleClient(record.group, record.address)}
                        >
                            {t.CLIENT}
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            style={{ marginRight: 8, marginBottom: 8 }}
                            onClick={() => handleDetail(record.group, record.address)}
                        >
                            {t.CONSUME_DETAIL}
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            style={{ marginRight: 8, marginBottom: 8 }}
                            onClick={() => handleUpdateConfigDialog(record.group)}
                        >
                            {t.CONFIG}
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            style={{ marginRight: 8, marginBottom: 8 }}
                            onClick={() => handleRefreshConsumerGroup(record.group)}
                        >
                            {t.REFRESH}
                        </Button>
                        {!sysFlag && writeOperationEnabled && (
                            <Button
                                type="danger"
                                size="small"
                                style={{ marginRight: 8, marginBottom: 8 }}
                                onClick={() => handleDelete(record.group)}
                            >
                                {t.DELETE}
                            </Button>
                        )}
                    </>
                );
            },
        },
    ];

    const handleTableChange = (pagination) => {
        setPaginationConf(pagination);
        // 这里可以根据pagination的变化来重新获取数据或进行前端分页
    };

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip="Loading...">
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ marginRight: '8px' }}>{t.SUBSCRIPTION_GROUP}:</label>
                            <Input
                                style={{ width: '200px' }}
                                value={filterStr}
                                onChange={(e) => setFilterStr(e.target.value)}
                            />
                        </div>
                        <Checkbox checked={filterNormal} onChange={(e) => setFilterNormal(e.target.checked)}>
                            {t.NORMAL}
                        </Checkbox>
                        {rmqVersion && (
                            <Checkbox checked={filterFIFO} onChange={(e) => setFilterFIFO(e.target.checked)}>
                                {t.FIFO}
                            </Checkbox>
                        )}
                        <Checkbox checked={filterSystem} onChange={(e) => setFilterSystem(e.target.checked)}>
                            {t.SYSTEM}
                        </Checkbox>
                        {writeOperationEnabled && (
                            <Button type="primary" onClick={handleOpenAddDialog}>
                                {t.ADD} / {t.UPDATE}
                            </Button>
                        )}
                        <Button type="primary" onClick={handleRefreshConsumerData}>
                            {t.REFRESH}
                        </Button>
                        <Switch
                            checked={intervalProcessSwitch}
                            onChange={(checked) => setIntervalProcessSwitch(checked)}
                            checkedChildren={t.AUTO_REFRESH}
                            unCheckedChildren={t.AUTO_REFRESH}
                        />
                    </div>
                </div>

                <Table
                    dataSource={consumerGroupShowList}
                    columns={columns}
                    rowKey="group"
                    bordered
                    pagination={{
                        current: paginationConf.current,
                        pageSize: paginationConf.pageSize,
                        total: paginationConf.total,
                        onChange: handleTableChange,
                    }}
                />
            </Spin>
        </div>
    );
};

export default ConsumerGroupList;
