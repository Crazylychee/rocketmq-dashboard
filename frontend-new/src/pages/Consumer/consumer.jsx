import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Checkbox, Switch, Spin, Modal, notification } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import { remoteApi } from '../../api/remoteApi/remoteApi';
import ClientInfoModal from "../../components/consumer/ClientInfoModal";
import ConsumerDetailModal from "../../components/consumer/ConsumerDetailModal";
import ConsumerConfigModal from "../../components/consumer/ConsumerConfigModal";
import DeleteConsumerModal from "../../components/consumer/DeleteConsumerModal";

const ConsumerGroupList = () => {
    const { t } = useLanguage();
    const [filterStr, setFilterStr] = useState('');
    const [filterNormal, setFilterNormal] = useState(true);
    const [filterFIFO, setFilterFIFO] = useState(false);
    const [filterSystem, setFilterSystem] = useState(false);
    const [rmqVersion, setRmqVersion] = useState(true);
    const [writeOperationEnabled, setWriteOperationEnabled] = useState(true);
    const [intervalProcessSwitch, setIntervalProcessSwitch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [consumerGroupShowList, setConsumerGroupShowList] = useState([]);
    const [allConsumerGroupList, setAllConsumerGroupList] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showClientInfo, setShowClientInfo] = useState(false);
    const [showConsumeDetail, setShowConsumeDetail] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [isAddConfig,setIsAddConfig] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const [paginationConf, setPaginationConf] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [sortConfig, setSortConfig] = useState({
        sortKey: null,
        sortOrder: 1,
    });

    const loadConsumerGroups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await remoteApi.queryConsumerGroupList(true);
            if (response.status === 0) {
                setAllConsumerGroupList(response.data);
                filterList(1, response.data);
            } else {
                Modal.error({ title: t.ERROR, content: response.errMsg });
            }
        } catch (error) {
            Modal.error({ title: t.ERROR, content: t.FAILED_TO_FETCH_DATA });
            console.error("Error loading consumer groups:", error);
        } finally {
            setLoading(false);
        }
    }, [t]);

    const filterByType = (str, type, version) => {
        if (filterSystem && type === "SYSTEM") return true;
        if (filterNormal && (type === "NORMAL" || (!version && type === "FIFO"))) return true;
        if (filterFIFO && type === "FIFO") return true;
        return false;
    };

    const filterList = useCallback((currentPage, data) => {
        // 排序处理
        let sortedData = [...data];
        if (sortConfig.sortKey) {
            sortedData.sort((a, b) => {
                const aValue = a[sortConfig.sortKey];
                const bValue = b[sortConfig.sortKey];
                if (typeof aValue === 'string') {
                    return sortConfig.sortOrder * aValue.localeCompare(bValue);
                }
                return sortConfig.sortOrder * (aValue > bValue ? 1 : -1);
            });
        }

        // 过滤处理
        const lowExceptStr = filterStr.toLowerCase();
        const canShowList = sortedData.filter(element =>
            filterByType(element.group, element.subGroupType, rmqVersion) &&
            element.group.toLowerCase().includes(lowExceptStr)
        );

        // 更新分页和显示列表
        const perPage = paginationConf.pageSize;
        const from = (currentPage - 1) * perPage;
        const to = from + perPage;

        setPaginationConf(prev => ({
            ...prev,
            current: currentPage,
            total: canShowList.length,
        }));
        setConsumerGroupShowList(canShowList.slice(from, to));
    }, [filterStr, filterNormal, filterSystem, filterFIFO, rmqVersion, sortConfig, paginationConf.pageSize]);


    const doSort = useCallback(() => {
        const sortedList = [...allConsumerGroupList];

        if (sortConfig.sortKey === 'diffTotal') {
            sortedList.sort((a, b) => {
                return (a.diffTotal > b.diffTotal) ? sortConfig.sortOrder :
                    ((b.diffTotal > a.diffTotal) ? -sortConfig.sortOrder : 0);
            });
        }
        if (sortConfig.sortKey === 'group') {
            sortedList.sort((a, b) => {
                return (a.group > b.group) ? sortConfig.sortOrder :
                    ((b.group > a.group) ? -sortConfig.sortOrder : 0);
            });
        }
        if (sortConfig.sortKey === 'count') {
            sortedList.sort((a, b) => {
                return (a.count > b.count) ? sortConfig.sortOrder :
                    ((b.count > a.count) ? -sortConfig.sortOrder : 0);
            });
        }
        if (sortConfig.sortKey === 'consumeTps') {
            sortedList.sort((a, b) => {
                return (a.consumeTps > b.consumeTps) ? sortConfig.sortOrder :
                    ((b.consumeTps > a.consumeTps) ? -sortConfig.sortOrder : 0);
            });
        }

        setAllConsumerGroupList(sortedList);
        filterList(paginationConf.current, sortedList);
    }, [sortConfig, allConsumerGroupList, paginationConf.current]);

    useEffect(() => {
        loadConsumerGroups();
    }, [loadConsumerGroups]);

    useEffect(() => {
        let intervalId;
        if (intervalProcessSwitch) {
            intervalId = setInterval(loadConsumerGroups, 10000);
        }
        return () => clearInterval(intervalId);
    }, [intervalProcessSwitch, loadConsumerGroups]);


    useEffect(() => {
        filterList(paginationConf.current, allConsumerGroupList);
    }, [allConsumerGroupList, filterStr, filterNormal, filterSystem, filterFIFO, sortConfig, filterList, paginationConf.current]);

    const handleFilterInputChange = (value) => {
        setFilterStr(value);
        setPaginationConf(prev => ({ ...prev, current: 1 }));
    };

    const handleTypeFilterChange = (filterType, checked) => {
        switch (filterType) {
            case 'normal':
                setFilterNormal(checked);
                break;
            case 'fifo':
                setFilterFIFO(checked);
                break;
            case 'system':
                setFilterSystem(checked);
                break;
            default:
                break;
        }
        setPaginationConf(prev => ({ ...prev, current: 1 }));
    };

    const handleRefreshConsumerData = async () => {
        setLoading(true);
        const refreshResult = await remoteApi.refreshAllConsumerGroup();
        setLoading(false);

        if (refreshResult && refreshResult.status === 0) {
            notification.success({ message: t.REFRESH_SUCCESS, duration: 2 });
            loadConsumerGroups();
        } else if (refreshResult && refreshResult.errMsg) {
            notification.error({ message: t.REFRESH_FAILED + ": " + refreshResult.errMsg, duration: 2 });
        } else {
            notification.error({ message: t.REFRESH_FAILED, duration: 2 });
        }
    };

    const handleOpenAddDialog = () => {
        setIsAddConfig(true)
        setShowConfig(true);
    };

    // 修改操作按钮的点击处理函数
    const handleClient = (group, address) => {
        setSelectedGroup(group);
        setSelectedAddress(address);
        setShowClientInfo(true);
    };

    const handleDetail = (group, address) => {
        setSelectedGroup(group);
        setSelectedAddress(address);
        setShowConsumeDetail(true);
    };

    const handleUpdateConfigDialog = (group) => {
        setSelectedGroup(group);
        setShowConfig(true);
    };


    const handleDelete = (group) => {
        setSelectedGroup(group);
        setShowDeleteModal(true);
    };

    const handleRefreshConsumerGroup = async (group) => {
        setLoading(true);
        const response = await remoteApi.refreshConsumerGroup(group);
        setLoading(false);
        if (response.status === 0) {
            Modal.success({ content: `${group} ${t.REFRESHED}` });
            loadConsumerGroups();
        } else {
            Modal.error({ title: t.ERROR, content: response.errMsg });
        }
    };


    const handleSort = (sortKey) => {
        setSortConfig(prev => ({
            sortKey,
            sortOrder: prev.sortKey === sortKey ? -prev.sortOrder : 1,
        }));
        setPaginationConf(prev => ({ ...prev, current: 1 }));
    };

    const columns = [
        {
            title: <a onClick={() => handleSort('group')}>{t.SUBSCRIPTION_GROUP}</a>,
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
            title: <a onClick={() => handleSort('count')}>{t.QUANTITY}</a>,
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
            title: <a onClick={() => handleSort('consumeTps')}>TPS</a>,
            dataIndex: 'consumeTps',
            key: 'consumeTps',
            align: 'center',
        },
        {
            title: <a onClick={() => handleSort('diffTotal')}>{t.DELAY}</a>,
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
                                type="primary"
                                danger
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
        setPaginationConf(prev => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize
        }));
        filterList(pagination.current, allConsumerGroupList);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip={t.LOADING}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ marginRight: '8px' }}>{t.SUBSCRIPTION_GROUP}:</label>
                            <Input
                                style={{ width: '200px' }}
                                value={filterStr}
                                onChange={(e) => handleFilterInputChange(e.target.value)}
                            />
                        </div>
                        <Checkbox checked={filterNormal} onChange={(e) => handleTypeFilterChange('normal', e.target.checked)}>
                            {t.NORMAL}
                        </Checkbox>
                        {rmqVersion && (
                            <Checkbox checked={filterFIFO} onChange={(e) => handleTypeFilterChange('fifo', e.target.checked)}>
                                {t.FIFO}
                            </Checkbox>
                        )}
                        <Checkbox checked={filterSystem} onChange={(e) => handleTypeFilterChange('system', e.target.checked)}>
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
                        {/*<Switch*/}
                        {/*    checked={intervalProcessSwitch}*/}
                        {/*    onChange={(checked) => setIntervalProcessSwitch(checked)}*/}
                        {/*    checkedChildren={t.AUTO_REFRESH}*/}
                        {/*    unCheckedChildren={t.AUTO_REFRESH}*/}
                        {/*/>*/}
                    </div>
                </div>

                <Table
                    dataSource={consumerGroupShowList}
                    columns={columns}
                    rowKey="group"
                    bordered
                    pagination={paginationConf}
                    onChange={handleTableChange}
                    sortDirections={['ascend', 'descend']}
                />
            </Spin>

            <ClientInfoModal
                visible={showClientInfo}
                group={selectedGroup}
                address={selectedAddress}
                onCancel={() => setShowClientInfo(false)}
            />

            <ConsumerDetailModal
                visible={showConsumeDetail}
                group={selectedGroup}
                address={selectedAddress}
                onCancel={() => setShowConsumeDetail(false)}
            />

            <ConsumerConfigModal
                visible={showConfig}
                isAddConfig={isAddConfig}
                group={selectedGroup}
                onCancel={() => setShowConfig(false)}
                onSuccess={loadConsumerGroups}
            />

            <DeleteConsumerModal
                visible={showDeleteModal}
                group={selectedGroup}
                onCancel={() => setShowDeleteModal(false)}
                onSuccess={loadConsumerGroups}
            />
        </div>
    );
};

export default ConsumerGroupList;
