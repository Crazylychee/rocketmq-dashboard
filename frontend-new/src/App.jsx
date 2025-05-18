import React from 'react';
import AppRouter from './router'; // 你 router/index.jsx 导出的组件
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <ToastContainer />
            <AppRouter />
        </>
    );
}

export default App;
