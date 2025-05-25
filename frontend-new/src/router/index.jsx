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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd'; // 导入 Layout 组件
import Login from '../pages/Login/login';
import Ops from '../pages/Ops/ops';
import Proxy from '../pages/Proxy/proxy';
import Cluster from '../pages/Cluster/cluster';
import Topic from '../pages/Topic/topic';
import Consumer from '../pages/Consumer/consumer';
import Producer from '../pages/Producer/producer';
import Message from '../pages/Message/message';
import DlqMessage from '../pages/DlqMessage/dlqmessage';
import MessageTrace from '../pages/MessageTrace/messagetrace';
import Acl from '../pages/Acl/acl';

import Navbar from '../components/Navbar';
import DashboardPage from "../pages/Dashboard/DashboardPage"; // 确保这个路径正确

const { Header, Content, Footer } = Layout; // 解构出需要的 Layout 子组件

const AppRouter = () => {
    return (
        <Router>
            {/* 使用 Ant Design 的 Layout 组件包裹整个应用 */}
            <Layout style={{ minHeight: '100vh' }}> {/* 设置最小高度为视口高度，确保背景色能覆盖整个页面 */}
                {/* 顶部导航栏，你现有的 Navbar 组件 */}
                {/* 如果 Navbar 组件内部已经渲染了 Ant Design 的 Header，可以考虑将其移到 Navbar 内部 */}
                {/* 如果 Navbar 组件只是一个纯粹的 div，那么这里用 Ant Design 的 Header 是为了统一 Ant Design Layout 结构 */}
                <Header style={{ padding: 0, height: 'auto', lineHeight: 'normal' }}> {/* Header 默认有高度和行高，这里重置以适应 Navbar */}
                    <Navbar />
                </Header>

                {/* 主要内容区域，使用 Content 组件 */}
                {/* Content 的背景色将由 theme.js 中的 Layout.contentBg 控制 */}
                <Content style={{ padding: '24px', backgroundColor: '#f9fcfe' }}> {/* 可以根据需要调整内边距 */}
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/ops" element={<Ops />} />
                        <Route path="/proxy" element={<Proxy />} />
                        <Route path="/cluster" element={<Cluster />} />
                        <Route path="/topic" element={<Topic />} />
                        <Route path="/consumer" element={<Consumer />} />
                        <Route path="/producer" element={<Producer />} />
                        <Route path="/message" element={<Message />} />
                        <Route path="/dlqMessage" element={<DlqMessage />} />
                        <Route path="/messageTrace" element={<MessageTrace />} />
                        <Route path="/acl" element={<Acl />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Content>

                {/* 可选：添加页脚 */}
                {/* <Footer style={{ textAlign: 'center' }}>
                    你的应用名称 ©2023
                </Footer> */}
            </Layout>
        </Router>
    );
};

export default AppRouter;
