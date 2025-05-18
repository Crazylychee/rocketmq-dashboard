import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/login';
import Dashboard from '../pages/Dashboard/dashboard';
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

import Navbar from '../components/Navbar'; // 直接引入 Navbar

const AppRouter = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
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
        </Router>
    );
};

export default AppRouter;
