import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Button, Drawer, Grid, Space } from 'antd';
import { GlobalOutlined, DownOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext'; // Internationalization Context

const { Header } = Layout;
const { useBreakpoint } = Grid; // Used to determine screen breakpoints

const Navbar = ({ username = '', rmqVersion = true, showAcl = true, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { lang, setLang, t } = useLanguage();
    const screens = useBreakpoint(); // Get current screen size breakpoints

    const [drawerVisible, setDrawerVisible] = useState(false); // Controls drawer visibility

    // Get selected menu item key based on current route path
    const getPath = () => location.pathname.replace('/', '');

    const handleMenuClick = ({ key }) => {
        navigate(`/${key}`);
        setDrawerVisible(false); // Close drawer after clicking a menu item
    };

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

    // Menu item configuration
    const menuItems = [
        { key: 'ops', label: t.OPS },
        ...(rmqVersion ? [{ key: 'proxy', label: t.PROXY }] : []),
        { key: '', label: t.DASHBOARD }, // Dashboard corresponds to root path
        { key: 'cluster', label: t.CLUSTER },
        { key: 'topic', label: t.TOPIC },
        { key: 'consumer', label: t.CONSUMER },
        { key: 'producer', label: t.PRODUCER },
        { key: 'message', label: t.MESSAGE },
        { key: 'dlqMessage', label: t.DLQ_MESSAGE },
        { key: 'messageTrace', label: t.MESSAGETRACE },
        ...(showAcl ? [{ key: 'acl', label: t.WHITE_LIST }] : []),
    ];

    // Determine if it's a small screen (e.g., less than md)
    const isSmallScreen = !screens.md;
    // Determine if it's an extra small screen (e.g., less than sm)
    const isExtraSmallScreen = !screens.sm;

    return (
        <Header
            className="navbar"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isExtraSmallScreen ? '0 16px' : '0 24px', // Smaller padding on extra small screens
            }}
        >
            <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
                <div
                    style={{
                        fontWeight: 'bold',
                        marginRight: isSmallScreen ? '16px' : '24px', // Adjust margin on small screens
                        whiteSpace: 'nowrap', // Prevent text wrapping
                        flexShrink: 0, // Prevent shrinking in flex container
                        color: 'white', // Title text color also set to white
                        fontSize: isSmallScreen ? '14px' : '18px',
                    }}
                >
                    {t.TITLE}
                </div>

                {!isSmallScreen && ( // Display full menu on large screens
                    <Menu
                        onClick={handleMenuClick}
                        selectedKeys={[getPath()]}
                        mode="horizontal"
                        items={menuItems}
                        theme="dark" // Use dark theme to match Header background
                        style={{ flex: 1, minWidth: 0 }} // Allow menu items to adapt width
                    />
                )}
            </div>

            <Space size={isExtraSmallScreen ? 8 : 16} > {/* Adjust spacing for buttons */}
                <Dropdown overlay={langMenu}>
                    <Button icon={<GlobalOutlined />} size="small">
                        {!isExtraSmallScreen && t.CHANGE_LANG} {/* Hide text on extra small screens */}
                        <DownOutlined />
                    </Button>
                </Dropdown>

                <Dropdown overlay={versionMenu}>
                    <Button size="small">
                        {!isExtraSmallScreen && t.CHANGE_VERSION}
                        <DownOutlined />
                    </Button>
                </Dropdown>
                {username && (
                    <Dropdown overlay={userMenu}>
                        <Button icon={<UserOutlined />} size="small">
                            {!isExtraSmallScreen && username}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                )}

                {isSmallScreen && ( // Display hamburger icon on small screens
                    <Button
                        type="primary"
                        icon={<MenuOutlined />}
                        onClick={() => setDrawerVisible(true)}
                        style={{ marginLeft: isExtraSmallScreen ? 8 : 16 }} // Adjust margin for hamburger icon
                    />
                )}
            </Space>

            {/* 修改这里的 Drawer 和 Menu 组件 */}
            <Drawer
                // 默认的 Drawer 背景色是白色，如果需要修改 Drawer 自身的背景色，则需要额外设置
                // 或者在 bodyStyle 中设置深色背景，然后让 Menu 覆盖
                title={t.MENU} // Drawer title
                placement="left" // Drawer pops out from the left
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                // 如果你想让 Drawer 的背景和 Menu 背景色一致，可以这样设置 bodyStyle
                // 或者在 theme.js 中设置 components.Drawer.colorBgElevated 等
                bodyStyle={{ padding: 0, backgroundColor: '#1c324a' }} // 将 Drawer 的 body 背景也设置为深色
                width={200} // Set drawer width
            >
                <Menu
                    onClick={handleMenuClick}
                    selectedKeys={[getPath()]}
                    mode="inline" // Use vertical menu in drawer
                    items={menuItems}
                    theme="dark"
                    style={{ height: '100%', borderRight: 0 }} // Ensure menu fills the drawer
                />
            </Drawer>
        </Header>
    );
};

export default Navbar;
