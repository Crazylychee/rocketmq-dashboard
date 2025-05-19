import React from 'react';
import AppRouter from './router'; // 你 router/index.jsx 导出的组件
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ConfigProvider} from "antd";
import theme from "./assets/styles/theme";

function App() {
    return (
        <>
            <ConfigProvider theme={theme}>
            <ToastContainer />
            <AppRouter />
            </ConfigProvider>
        </>
    );
}

export default App;
