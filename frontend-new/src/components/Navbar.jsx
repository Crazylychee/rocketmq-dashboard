import React from 'react';
import { Layout, Menu, Dropdown, Button } from 'antd';
import { GlobalOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import {translations} from "../i18n";

const { Header } = Layout;

const Navbar = ({ username = '', rmqVersion = true, showAcl = true, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { lang, setLang ,t} = useLanguage();  // 从 useLanguage 拿到翻译资源 t
    const getPath = () => location.pathname.replace('/', '');

    const handleMenuClick = ({ key }) => navigate(`/${key}`);

    const langMenu = (
        <Menu onClick={({ key }) => setLang(key)}>
            <Menu.Item key="en">{t.ENGLISH}</Menu.Item>
            <Menu.Item key="zh">{t.CHINESE}</Menu.Item>
        </Menu>
    );

    const versionMenu = (
        <Menu onClick={({ key }) => alert(t.version.switchVersion + ': ' + key)}>
            <Menu.Item key="5">RocketMQ v5</Menu.Item>
            <Menu.Item key="4">RocketMQ v4</Menu.Item>
        </Menu>
    );

    const userMenu = (
        <Menu>
            <Menu.Item key="logout" onClick={onLogout}>{t.LOGOUT}</Menu.Item>
        </Menu>
    );

    const items = [
        { key: 'ops', label: t.OPS },
        ...(rmqVersion ? [{ key: 'proxy', label: t.PROXY }] : []),
        { key: '', label: t.DASHBOARD },
        { key: 'cluster', label: t.CLUSTER },
        { key: 'topic', label: t.TOPIC },
        { key: 'consumer', label: t.CONSUMER },
        { key: 'producer', label: t.PRODUCER },
        { key: 'message', label: t.MESSAGE },
        { key: 'dlqMessage', label: t.DLQ_MESSAGE },
        { key: 'messageTrace', label: t.MESSAGETRACE },
        ...(showAcl ? [{ key: 'acl', label: t.WHITE_LIST }] : []), // 假设你用的是“白名单”对应 ACL
    ];

    return (
        <Header
            className="navbar"
            style={{
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 24px',
            }}
        >
            <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', marginRight: '24px' }}>🚀 RocketMQ</div>
                <Menu onClick={handleMenuClick} selectedKeys={[getPath()]} mode="horizontal" items={items} />
            </div>
            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Dropdown overlay={langMenu}>
                    <Button icon={<GlobalOutlined />} size="small">
                        {t.CHANGE_LANG} <DownOutlined />
                    </Button>
                </Dropdown>

                <Dropdown overlay={versionMenu}>
                    <Button size="small">
                        {t.CHANGE_VERSION} <DownOutlined />
                    </Button>
                </Dropdown>
                {username && (
                    <Dropdown overlay={userMenu}>
                        <Button icon={<UserOutlined />} size="small">
                            {username} <DownOutlined />
                        </Button>
                    </Dropdown>
                )}
            </div>
        </Header>
    );
};

export default Navbar;
