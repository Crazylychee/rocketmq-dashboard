/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect } from 'react'; // 引入 useCallback
import { Modal, Button, Select, Input, Card, Row, Col, notification, Spin } from 'antd'; // 引入 Spin 和 notification
import { useLanguage } from '../../i18n/LanguageContext';
import { remoteApi } from "../../api/remoteApi/remoteApi"; // 确保路径正确


const { Option } = Select;

const ProxyManager = () => {
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false); // 加载状态
    const [proxyAddrList, setProxyAddrList] = useState([]); // proxy 地址列表
    const [selectedProxy, setSelectedProxy] = useState(''); // 当前选中的 proxy 地址
    const [newProxyAddr, setNewProxyAddr] = useState(''); // 新增 proxy 地址的输入框值
    const [allProxyConfig, setAllProxyConfig] = useState({}); // 当前选中 proxy 的配置详情

    const [showModal, setShowModal] = useState(false); // 控制 Modal 弹窗显示
    const [writeOperationEnabled, setWriteOperationEnabled] = useState(true); // 写操作权限，默认 true
    const [notificationApi, notificationContextHolder] = notification.useNotification();
    // 模拟 Angular 的 $window.sessionStorage.getItem("userrole")
    // 在 React 中，通常在组件挂载时获取一次
    useEffect(() => {
        const userRole = sessionStorage.getItem("userrole");
        // 如果 userRole 为 null 默认为 true，如果 userRole 为 1 也为 true，否则为 false
        const isWriteEnabled = userRole === null || userRole === '1';
        setWriteOperationEnabled(isWriteEnabled);
    }, []); // 只在组件挂载时执行一次

    // 首次加载页面时获取 Proxy 首页数据
    useEffect(() => {
        setLoading(true);
        remoteApi.queryProxyHomePage((resp) => {
            setLoading(false);
            if (resp.status === 0) {
                const { proxyAddrList, currentProxyAddr } = resp.data;
                setProxyAddrList(proxyAddrList || []);
                setSelectedProxy(currentProxyAddr || (proxyAddrList && proxyAddrList.length > 0 ? proxyAddrList[0] : ''));

                // 首次加载成功后，立即查询当前选中 Proxy 的详细配置
                if (currentProxyAddr) {
                    localStorage.setItem('proxyAddr', currentProxyAddr); // 同步 localStorage
                } else if (proxyAddrList && proxyAddrList.length > 0) {
                    localStorage.setItem('proxyAddr', proxyAddrList[0]);
                }

            } else {
                notificationApi.error({ message: resp.errMsg || t.FETCH_PROXY_LIST_FAILED, duration: 2 });
            }
        });
    }, [t]); // t 依赖，确保语言切换时effect不重新运行，但首次加载时确保语言上下文已就绪

    // Select 选择器改变时触发的逻辑
    const handleSelectChange = (value) => {
        setSelectedProxy(value);
        localStorage.setItem('proxyAddr', value); // 更新 localStorage
    };


    // "添加" 按钮点击事件
    const handleAddProxyAddr = () => {
        if (!newProxyAddr.trim()) {
            notificationApi.warning({ message: t.INPUT_PROXY_ADDR_REQUIRED || "Please input a new proxy address.", duration: 2 });
            return;
        }
        setLoading(true);
        remoteApi.addProxyAddr(newProxyAddr.trim(), (resp) => {
            setLoading(false);
            if (resp.status === 0) {
                // 如果列表中不存在，则添加
                if (!proxyAddrList.includes(newProxyAddr.trim())) {
                    setProxyAddrList(prevList => [...prevList, newProxyAddr.trim()]);
                }
                setNewProxyAddr(''); // 清空输入框
                notificationApi.info({ message: t.SUCCESS || "SUCCESS", duration: 2 });
            } else {
                notificationApi.error({ message: resp.errMsg || t.ADD_PROXY_FAILED, duration: 2 });
            }
        });
    };

    return (
        <Spin spinning={loading} tip={t.LOADING}>
            <div className="container-fluid" style={{ padding: '24px' }} id="deployHistoryList">
                <Card
                    title={
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            ProxyServerAddressList
                        </div>
                    }
                    bordered={false}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto" style={{ minWidth: 300, maxWidth: 500 }}>
                            <Select
                                style={{ width: '100%' }}
                                value={selectedProxy}
                                onChange={handleSelectChange} // 使用新的处理函数
                                placeholder={t.SELECT}
                                showSearch // 允许搜索
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {proxyAddrList.map(addr => (
                                    <Option key={addr} value={addr}>
                                        {addr}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    {writeOperationEnabled && (
                        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
                            <Col>
                                <label htmlFor="newProxyAddrInput">ProxyAddr:</label>
                            </Col>
                            <Col>
                                <Input
                                    id="newProxyAddrInput" // 更改 id 避免冲突
                                    style={{ width: 300 }}
                                    value={newProxyAddr}
                                    onChange={(e) => setNewProxyAddr(e.target.value)}
                                    placeholder={t.INPUT_PROXY_ADDR}
                                />
                            </Col>
                            <Col>
                                <Button type="primary" onClick={handleAddProxyAddr}>
                                    {t.ADD}
                                </Button>
                            </Col>
                        </Row>
                    )}
                </Card>

                <Modal
                    open={showModal}
                    onCancel={() => setShowModal(false)}
                    title={`${t.PROXY_CONFIG} [${selectedProxy}]`}
                    footer={
                        <div style={{ textAlign: 'center' }}>
                            <Button onClick={() => setShowModal(false)}>{t.CLOSE}</Button>
                        </div>
                    }
                    width={800}
                    bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }} // 限制高度，自动滚动
                >
                    <table className="table table-bordered" style={{ width: '100%' }}> {/* 确保表格宽度 */}
                        <tbody>
                        {Object.entries(allProxyConfig).length > 0 ? (
                            Object.entries(allProxyConfig).map(([key, value]) => (
                                <tr key={key}>
                                    <td style={{ fontWeight: 500, width: '30%' }}>{key}</td> {/* 适当调整列宽 */}
                                    <td>{value}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" style={{ textAlign: 'center' }}>{t.NO_CONFIG_DATA || "No configuration data available."}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </Modal>
            </div>
        </Spin>
    );
};

export default ProxyManager;
