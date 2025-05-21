import React from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const Login = () => {
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { username, password } = values;
        try {
            const response = await axios.post('/login/login.do', null, {
                params: { username, password },
            });

            const resp = response.data;

            if (resp.status === 0) {
                message.success('登录成功，正在跳转...', 2);
                sessionStorage.setItem('username', resp.data.loginUserName);
                sessionStorage.setItem('userrole', resp.data.loginUserRole);
                setTimeout(() => {
                    window.location = resp.data.contextPath;
                }, 2000);
            } else {
                message.error(resp.errMsg, 2);
            }
        } catch (error) {
            message.error('登录请求失败', 2);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 24, boxShadow: '0 2px 8px #f0f1f2', borderRadius: 8 }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                WELCOME
            </Title>
            <Form
                form={form}
                name="login_form"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ username: '', password: '' }}
            >
                <Form.Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                >
                    <Input placeholder="请输入用户名" />
                </Form.Item>

                <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password placeholder="请输入密码" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
