import React from 'react';

import { useState } from 'react';
import { Row, Col, Input, Select, DatePicker, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Option } = Select;

const Dashboard = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [selectedTopic, setSelectedTopic] = useState('');
    const topicNames = ['Topic A', 'Topic B', 'Topic C'];

    return (
        <div className="container-fluid" style={{ padding: '24px' }}>
            {/* 日期选择区域 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col md={12}></Col>
                <Col md={12}>
                    <Row align="middle">
                        <Col md={4} style={{ marginTop: 8 }}>
                            <label>{t('DATE')}:</label>
                        </Col>
                        <Col md={8}>
                            <DatePicker
                                style={{ width: '100%' }}
                                value={date}
                                onChange={(value) => setDate(value)}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* 图表区 1 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col md={12}>
                    <Card title="Main Chart" style={{ height: 350 }}>
                        <div id="main" style={{ height: '100%' }} />
                    </Card>
                </Col>
                <Col md={12}>
                    <Card title="Line Chart" style={{ height: 350 }}>
                        <div id="line" style={{ height: '100%' }} />
                    </Card>
                </Col>
            </Row>

            {/* Topic 选择区域 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col md={12}></Col>
                <Col md={12}>
                    <Row align="middle">
                        <Col md={4}>
                            <label>{t('TOPIC')}:</label>
                        </Col>
                        <Col md={8}>
                            <Select
                                showSearch
                                placeholder={t('SELECT_TOPIC')}
                                value={selectedTopic}
                                onChange={(value) => setSelectedTopic(value)}
                                style={{ width: '100%' }}
                            >
                                {topicNames.map((topic) => (
                                    <Option key={topic} value={topic}>
                                        {topic}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* 图表区 2 */}
            <Row gutter={16}>
                <Col md={12}>
                    <Card title="Topic Bar" style={{ height: 350 }}>
                        <div id="topicBar" style={{ height: '100%' }} />
                    </Card>
                </Col>
                <Col md={12}>
                    <Card title="Topic Line" style={{ height: 350 }}>
                        <div id="topicLine" style={{ height: '100%' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
