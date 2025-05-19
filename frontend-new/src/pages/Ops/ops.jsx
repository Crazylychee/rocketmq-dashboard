import React, { useState, useEffect } from 'react';
import { Select, Button, Switch, Input, Typography, Space, message } from 'antd';
import {tools,remoteApi} from '../../api/remoteApi/remoteApi';

const { Title } = Typography;
const { Option } = Select;

const Ops = () => {
    const [namesrvAddrList, setNamesrvAddrList] = useState([]);
    const [selectedNamesrv, setSelectedNamesrv] = useState('');
    const [newNamesrvAddr, setNewNamesrvAddr] = useState('');
    const [useVIPChannel, setUseVIPChannel] = useState(false);
    const [useTLS, setUseTLS] = useState(false);
    const [writeOperationEnabled, setWriteOperationEnabled] = useState(true); // Default to true

    useEffect(() => {
        const fetchOpsData = async () => {
            const userRole = sessionStorage.getItem("userrole");
            setWriteOperationEnabled(userRole === null || userRole === "1"); // Assuming "1" means write access

            const resp = await remoteApi.queryOpsHomePage();
            if (resp.status === 0) {
                setNamesrvAddrList(resp.data.namesvrAddrList);
                setUseVIPChannel(resp.data.useVIPChannel);
                setUseTLS(resp.data.useTLS);
                setSelectedNamesrv(resp.data.currentNamesrv);
            } else {
                message.error(resp.errMsg);
            }
        };
        fetchOpsData();
    }, []);

    const handleUpdateNameSvrAddr = async () => {
        if (!selectedNamesrv) {
            message.warning('请选择一个 NameServer 地址');
            return;
        }
        const resp = await remoteApi.updateNameSvrAddr(selectedNamesrv);
        if (resp.status === 0) {
            message.info('UPDATE SUCCESS');
        } else {
            message.error(resp.errMsg);
        }
    };

    const handleAddNameSvrAddr = async () => {
        if (!newNamesrvAddr.trim()) {
            message.warning('请输入新的 NameServer 地址');
            return;
        }
        const resp = await remoteApi.addNameSvrAddr(newNamesrvAddr.trim());
        if (resp.status === 0) {
            if (!namesrvAddrList.includes(newNamesrvAddr.trim())) {
                setNamesrvAddrList([...namesrvAddrList, newNamesrvAddr.trim()]);
            }
            setNewNamesrvAddr('');
            message.info('ADD SUCCESS');
        } else {
            message.error(resp.errMsg);
        }
    };

    const handleUpdateIsVIPChannel = async (checked) => {
        setUseVIPChannel(checked); // Optimistic update
        const resp = await remoteApi.updateIsVIPChannel(checked);
        if (resp.status === 0) {
            message.info('UPDATE SUCCESS');
        } else {
            message.error(resp.errMsg);
            setUseVIPChannel(!checked); // Revert on error
        }
    };

    const handleUpdateUseTLS = async (checked) => {
        setUseTLS(checked); // Optimistic update
        const resp = await remoteApi.updateUseTLS(checked);
        if (resp.status === 0) {
            message.info('UPDATE SUCCESS');
        } else {
            message.error(resp.errMsg);
            setUseTLS(!checked); // Revert on error
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={4}>NameServerAddressList</Title>
                <Space wrap align="start">
                    <Select
                        style={{ minWidth: 400, maxWidth: 500 }}
                        value={selectedNamesrv}
                        onChange={setSelectedNamesrv}
                        disabled={!writeOperationEnabled}
                        placeholder="请选择 NameServer 地址"
                    >
                        {namesrvAddrList.map((addr) => (
                            <Option key={addr} value={addr}>
                                {addr}
                            </Option>
                        ))}
                    </Select>

                    {writeOperationEnabled && (
                        <Button type="primary" onClick={handleUpdateNameSvrAddr}>
                            UPDATE
                        </Button>
                    )}

                    {writeOperationEnabled && (
                        <Input.Group compact style={{ minWidth: 400 }}>
                            <Input
                                style={{ width: 300 }}
                                placeholder="NamesrvAddr"
                                value={newNamesrvAddr}
                                onChange={(e) => setNewNamesrvAddr(e.target.value)}
                            />
                            <Button type="primary" onClick={handleAddNameSvrAddr}>
                                ADD
                            </Button>
                        </Input.Group>
                    )}
                </Space>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Title level={4}>IsUseVIPChannel</Title>
                <Space align="center">
                    <Switch
                        checked={useVIPChannel}
                        onChange={handleUpdateIsVIPChannel}
                        disabled={!writeOperationEnabled}
                    />
                    {writeOperationEnabled && (
                        <Button type="primary" onClick={() => handleUpdateIsVIPChannel(useVIPChannel)}>
                            UPDATE
                        </Button>
                    )}
                </Space>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Title level={4}>useTLS</Title>
                <Space align="center">
                    <Switch
                        checked={useTLS}
                        onChange={handleUpdateUseTLS}
                        disabled={!writeOperationEnabled}
                    />
                    {writeOperationEnabled && (
                        <Button type="primary" onClick={() => handleUpdateUseTLS(useTLS)}>
                            UPDATE
                        </Button>
                    )}
                </Space>
            </div>
        </div>
    );
};

export default Ops;
