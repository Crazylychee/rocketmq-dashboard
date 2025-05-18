import React, { useState } from 'react';
import { Modal, Button, Select, Input, Card, Space, Row, Col } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import 'antd/dist/reset.css';

const { Option } = Select;

const ProxyManager = ({ proxyAddrList = [], allProxyConfig = {}, writeOperationEnabled = true }) => {
    const { t } = useLanguage();
    const [selectedProxy, setSelectedProxy] = useState(proxyAddrList[0] || '');
    const [newProxyAddr, setNewProxyAddr] = useState('');
    const [showModal, setShowModal] = useState(false);

    const updateProxyAddr = () => {
        console.log('更新 ProxyAddr:', selectedProxy);
        setShowModal(true);
    };

    const addProxyAddr = () => {
        console.log('添加新 ProxyAddr:', newProxyAddr);
        setNewProxyAddr('');
    };

    return (
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
                            onChange={setSelectedProxy}
                            placeholder={t.SELECT}
                        >
                            {proxyAddrList.map(addr => (
                                <Option key={addr} value={addr}>
                                    {addr}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    {writeOperationEnabled && (
                        <Col>
                            <Button type="primary" onClick={updateProxyAddr}>
                                {t.UPDATE}
                            </Button>
                        </Col>
                    )}
                </Row>

                {writeOperationEnabled && (
                    <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
                        <Col>
                            <label htmlFor="proxyAddr">ProxyAddr:</label>
                        </Col>
                        <Col>
                            <Input
                                id="proxyAddr"
                                style={{ width: 300 }}
                                value={newProxyAddr}
                                onChange={(e) => setNewProxyAddr(e.target.value)}
                                placeholder={t.INPUT_PROXY_ADDR}
                            />
                        </Col>
                        <Col>
                            <Button type="primary" onClick={addProxyAddr}>
                                {t.ADD}
                            </Button>
                        </Col>
                    </Row>
                )}
            </Card>

            <Modal
                open={showModal}
                onCancel={() => setShowModal(false)}
                title={`[${selectedProxy}]`}
                footer={
                    <div style={{ textAlign: 'center' }}>
                        <Button onClick={() => setShowModal(false)}>{t.CLOSE}</Button>
                    </div>
                }
                width={800}
            >
                <table className="table table-bordered">
                    <tbody>
                    {Object.entries(allProxyConfig).map(([key, value]) => (
                        <tr key={key}>
                            <td style={{ fontWeight: 500 }}>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Modal>
        </div>
    );
};

export default ProxyManager;
