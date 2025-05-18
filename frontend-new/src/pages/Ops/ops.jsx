import React, { useState, useEffect } from 'react';
import { Select, Button, Switch, Input, Typography, Space, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Ops = ({
                            initialNamesrvAddrList = [],
                            initialSelectedNamesrv = '',
                            initialUseVIPChannel = false,
                            initialUseTLS = false,
                            writeOperationEnabled = true,
                            onUpdateNameSvrAddr,
                            onAddNameSvrAddr,
                            onUpdateIsVIPChannel,
                            onUpdateUseTLS,
                        }) => {
    const [namesrvAddrList, setNamesrvAddrList] = useState(initialNamesrvAddrList);
    const [selectedNamesrv, setSelectedNamesrv] = useState(initialSelectedNamesrv);
    const [newNamesrvAddr, setNewNamesrvAddr] = useState('');
    const [useVIPChannel, setUseVIPChannel] = useState(initialUseVIPChannel);
    const [useTLS, setUseTLS] = useState(initialUseTLS);

    useEffect(() => {
        if (JSON.stringify(namesrvAddrList) !== JSON.stringify(initialNamesrvAddrList)) {
            setNamesrvAddrList(initialNamesrvAddrList);
        }
    }, [initialNamesrvAddrList]);

    useEffect(() => {
        if (selectedNamesrv !== initialSelectedNamesrv) {
            setSelectedNamesrv(initialSelectedNamesrv);
        }
    }, [initialSelectedNamesrv]);

    useEffect(() => {
        if (useVIPChannel !== initialUseVIPChannel) {
            setUseVIPChannel(initialUseVIPChannel);
        }
    }, [initialUseVIPChannel]);

    useEffect(() => {
        if (useTLS !== initialUseTLS) {
            setUseTLS(initialUseTLS);
        }
    }, [initialUseTLS]);

    // 处理更新选中地址
    const handleUpdateNameSvrAddr = () => {
        if (!selectedNamesrv) {
            message.warning('请选择一个 NameServer 地址');
            return;
        }
        if (onUpdateNameSvrAddr) {
            onUpdateNameSvrAddr(selectedNamesrv);
        }
    };

    // 处理新增地址
    const handleAddNameSvrAddr = () => {
        if (!newNamesrvAddr.trim()) {
            message.warning('请输入新的 NameServer 地址');
            return;
        }
        if (onAddNameSvrAddr) {
            onAddNameSvrAddr(newNamesrvAddr.trim());
            setNewNamesrvAddr('');
        }
    };

    // 更新 VIP Channel 状态
    const handleUpdateIsVIPChannel = () => {
        if (onUpdateIsVIPChannel) {
            onUpdateIsVIPChannel(useVIPChannel);
        }
    };

    // 更新 TLS 状态
    const handleUpdateUseTLS = () => {
        if (onUpdateUseTLS) {
            onUpdateUseTLS(useTLS);
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
                        onChange={setUseVIPChannel}
                        disabled={!writeOperationEnabled}
                    />
                    {writeOperationEnabled && (
                        <Button type="primary" onClick={handleUpdateIsVIPChannel}>
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
                        onChange={setUseTLS}
                        disabled={!writeOperationEnabled}
                    />
                    {writeOperationEnabled && (
                        <Button type="primary" onClick={handleUpdateUseTLS}>
                            UPDATE
                        </Button>
                    )}
                </Space>
            </div>
        </div>
    );
};

export default Ops;
