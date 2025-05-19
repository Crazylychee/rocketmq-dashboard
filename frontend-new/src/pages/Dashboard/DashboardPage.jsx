import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Spin, DatePicker, Select, Card, Row, Col, Table, notification} from 'antd';
import * as echarts from 'echarts';
import moment from 'moment';
import { useLanguage } from '../../i18n/LanguageContext';

const { Option } = Select;

// Assume appConfig is available, e.g., defined globally or imported
// For this example, we'll define it here. In a real app, it would be in a config file.
const appConfig = {
    apiBaseUrl: 'http://localhost:8080'
};

// --- START: Adapted remoteApi service ---
const remoteApi = {
    // Helper function to build full URL
    buildUrl: (endpoint) => {
        // If URL starts with /, remove it to avoid double slash
        if (endpoint.charAt(0) === '/') {
            endpoint = endpoint.substring(1);
        }
        return `${appConfig.apiBaseUrl}/${endpoint}`;
    },

    queryTopic: async (callback) => {
        try {
            const response = await fetch(remoteApi.buildUrl("/topic/list.query"));
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error("Error fetching topic list:", error);
            callback({ status: 1, errMsg: "Failed to fetch topic list" }); // Simulate error response
        }
    },

    queryClusterList: async (callback) => {
        try {
            const response = await fetch(remoteApi.buildUrl("/cluster/list.query"));
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error("Error fetching cluster list:", error);
            callback({ status: 1, errMsg: "Failed to fetch cluster list" });
        }
    },

    queryBrokerHisData: async (date, callback) => {
        try {
            const url = new URL(remoteApi.buildUrl('/dashboard/broker.query'));
            url.searchParams.append('date', date);
            const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) }); // 15s timeout
            const data = await response.json();
            callback(data);
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error("Broker history data request timed out:", error);
                callback({ status: 1, errMsg: "Request timed out for broker history data" });
            } else {
                console.error("Error fetching broker history data:", error);
                callback({ status: 1, errMsg: "Failed to fetch broker history data" });
            }
        }
    },

    queryTopicHisData: async (date, topicName, callback) => {
        try {
            const url = new URL(remoteApi.buildUrl('/dashboard/topic.query'));
            url.searchParams.append('date', date);
            url.searchParams.append('topicName', topicName);
            const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) }); // 15s timeout
            const data = await response.json();
            callback(data);
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error("Topic history data request timed out:", error);
                callback({ status: 1, errMsg: "Request timed out for topic history data" });
            } else {
                console.error("Error fetching topic history data:", error);
                callback({ status: 1, errMsg: "Failed to fetch topic history data" });
            }
        }
    },

    queryTopicCurrentData: async (callback) => {
        try {
            const response = await fetch(remoteApi.buildUrl('/dashboard/topicCurrent.query'), { signal: AbortSignal.timeout(15000) }); // 15s timeout
            const data = await response.json();
            callback(data);
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error("Topic current data request timed out:", error);
                callback({ status: 1, errMsg: "Request timed out for topic current data" });
            } else {
                console.error("Error fetching topic current data:", error);
                callback({ status: 1, errMsg: "Failed to fetch topic current data" });
            }
        }
    }
};
// --- END: Adapted remoteApi service ---

// Mock tools from your Angular setup
const tools = {
    dashboardRefreshTime: 5000, // 5秒刷新一次
    generateBrokerMap: (brokerDetail, clusterAddrTable, brokerAddrTable) => {
        const clusterMap = {};
        Object.entries(clusterAddrTable).forEach(([clusterName, brokerAddrs]) => {
            clusterMap[clusterName] = [];
            brokerAddrs.forEach(addr => {
                const brokerName = Object.keys(brokerAddrTable).find(name =>
                    Object.values(brokerAddrTable[name]).includes(addr)
                );
                if (brokerName && brokerDetail[brokerName]) {
                    clusterMap[clusterName].push({
                        ...brokerDetail[brokerName],
                        index: 0
                    });
                }
            });
        });
        return clusterMap;
    }
};

const DashboardPage = () => {
    const { t } = useLanguage();
    const barChartRef = useRef(null);
    const lineChartRef = useRef(null);
    const topicBarChartRef = useRef(null);
    const topicLineChartRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(moment());
    const [topicNames, setTopicNames] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [brokerTableData, setBrokerTableData] = useState([]);


    const barChartInstance = useRef(null);
    const lineChartInstance = useRef(null);
    const topicBarChartInstance = useRef(null);
    const topicLineChartInstance = useRef(null);

    const initChart = useCallback((chartRef, titleText, isLine = false) => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            let option = {
                title: { text: titleText },
                tooltip: {},
                legend: { data: ['TotalMsg'] },
                axisPointer: { type: 'shadow' },
                xAxis: {
                    type: 'category',
                    data: [],
                    axisLabel: {
                        inside: false,
                        color: '#000000',
                        rotate: 0,
                        interval: 0
                    },
                    axisTick: { show: true },
                    axisLine: { show: true },
                    z: 10
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%'],
                    axisLabel: { formatter: (value) => value.toFixed(2) },
                    splitLine: { show: true }
                },
                series: [{ name: 'TotalMsg', type: 'bar', data: [] }]
            };

            if (isLine) {
                option = {
                    title: { text: titleText },
                    toolbox: {
                        feature: {
                            dataZoom: { yAxisIndex: 'none' },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    tooltip: { trigger: 'axis', axisPointer: { animation: false } },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '80%'],
                        axisLabel: { formatter: (value) => value.toFixed(2) },
                        splitLine: { show: true }
                    },
                    dataZoom: [{
                        type: 'inside', start: 90, end: 100
                    }, {
                        start: 0, end: 10, handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%', handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 }
                    }],
                    legend: { data: [], top: 30 },
                    xAxis: { type: 'time', boundaryGap: false, data: [] },
                    series: []
                };
            }
            chart.setOption(option);
            return chart;
        }
        return null;
    }, []);

    useEffect(() => {
        barChartInstance.current = initChart(barChartRef, t.BROKER + ' TOP 10');
        lineChartInstance.current = initChart(lineChartRef, t.BROKER + ' 5min trend', true);
        topicBarChartInstance.current = initChart(topicBarChartRef, t.TOPIC + ' TOP 10');
        topicLineChartInstance.current = initChart(topicLineChartRef, t.TOPIC + ' 5min trend', true);

        return () => {
            barChartInstance.current?.dispose();
            lineChartInstance.current?.dispose();
            topicBarChartInstance.current?.dispose();
            topicLineChartInstance.current?.dispose();
        };
    }, [t, initChart]);

    const getBrokerBarChartOp = useCallback((xAxisData, data) => {
        return {
            xAxis: { data: xAxisData },
            series: [{ name: 'TotalMsg', data: data }]
        };
    }, []);

    const getBrokerLineChartOp = useCallback((legend, data) => {
        const series = [];
        let xAxisData = [];
        let isFirstSeries = true;

        Object.entries(data).forEach(([key, values]) => {
            const tpsValues = [];
            values.forEach(tpsValue => {
                const tpsArray = tpsValue.split(",");
                if (isFirstSeries) {
                    xAxisData.push(moment(parseInt(tpsArray[0])).format("HH:mm:ss"));
                }
                tpsValues.push(parseFloat(tpsArray[1]));
            });
            isFirstSeries = false;
            series.push({
                name: key,
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                data: tpsValues
            });
        });

        return {
            legend: { data: legend },
            color: ["#FF0000", "#00BFFF", "#FF00FF", "#1ce322", "#000000", '#EE7942'],
            xAxis: { type: 'category', boundaryGap: false, data: xAxisData },
            series: series
        };
    }, []);

    const getTopicLineChartOp = useCallback((legend, data) => {
        const series = [];
        let xAxisData = [];
        let isFirstSeries = true;

        Object.entries(data).forEach(([key, values]) => {
            const tpsValues = [];
            values.forEach(tpsValue => {
                const tpsArray = tpsValue.split(",");
                if (isFirstSeries) {
                    xAxisData.push(moment(parseInt(tpsArray[0])).format("HH:mm:ss"));
                }
                tpsValues.push(parseFloat(tpsArray[2]));
            });
            isFirstSeries = false;
            series.push({
                name: key,
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                data: tpsValues
            });
        });

        return {
            legend: { data: legend },
            xAxis: { type: 'category', boundaryGap: false, data: xAxisData },
            series: series
        };
    }, []);

    const queryLineData = useCallback(async () => {
        const _date = date ? date.format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");

        lineChartInstance.current?.showLoading();
        await remoteApi.queryBrokerHisData(_date, (resp) => {
            lineChartInstance.current?.hideLoading();
            if (resp.status === 0) {
                const _data = {};
                const _xAxisData = [];
                Object.entries(resp.data).forEach(([address, values]) => {
                    _data[address] = values;
                    _xAxisData.push(address);
                });
                lineChartInstance.current?.setOption(getBrokerLineChartOp(_xAxisData, _data));
            } else {
                notification.error({ message: resp.errMsg || t.QUERY_BROKER_HISTORY_FAILED, duration: 2 });
            }
        });

        if (selectedTopic) {
            topicLineChartInstance.current?.showLoading();
            await remoteApi.queryTopicHisData(_date, selectedTopic, (resp) => {
                topicLineChartInstance.current?.hideLoading();
                if (resp.status === 0) {
                    const _data = {};
                    _data[selectedTopic] = resp.data;
                    topicLineChartInstance.current?.setOption(getTopicLineChartOp([selectedTopic], _data));
                } else {
                    notification.error({ message: resp.errMsg || t.QUERY_TOPIC_HISTORY_FAILED, duration: 2 });
                }
            });
        }
    }, [date, selectedTopic, getBrokerLineChartOp, getTopicLineChartOp, t]);

    useEffect(() => {
        setLoading(true);
        barChartInstance.current?.showLoading();
        remoteApi.queryClusterList((resp) => {
            setLoading(false);
            barChartInstance.current?.hideLoading();
            if (resp.status === 0) {
                const clusterAddrTable = resp.data.clusterInfo.clusterAddrTable;
                const brokerAddrTable = resp.data.clusterInfo.brokerAddrTable; // Corrected to brokerAddrTable
                const brokerDetail = resp.data.brokerServer;
                const clusterMap = tools.generateBrokerMap(brokerDetail, clusterAddrTable, brokerAddrTable);

                let brokerArray = [];
                Object.values(clusterMap).forEach(brokersInCluster => {
                    brokerArray = brokerArray.concat(brokersInCluster);
                });

                // Update broker table data
                setBrokerTableData(brokerArray.map(broker => ({
                    ...broker,
                    key: broker.brokerName // Ant Design Table needs a unique key
                })));

                brokerArray.sort((firstBroker, lastBroker) => {
                    const firstTotalMsg = parseFloat(firstBroker.msgGetTotalTodayNow || 0);
                    const lastTotalMsg = parseFloat(lastBroker.msgGetTotalTodayNow || 0);
                    return lastTotalMsg - firstTotalMsg;
                });

                const xAxisData = [];
                const data = [];
                brokerArray.slice(0, 10).forEach(broker => {
                    xAxisData.push(`${broker.brokerName}:${broker.index}`);
                    data.push(parseFloat(broker.msgGetTotalTodayNow || 0));
                });
                barChartInstance.current?.setOption(getBrokerBarChartOp(xAxisData, data));
            } else {
                notification.error({ message: resp.errMsg || t.QUERY_CLUSTER_LIST_FAILED, duration: 2 });
            }
        });
    }, [getBrokerBarChartOp, t]);

    useEffect(() => {
        topicBarChartInstance.current?.showLoading();
        remoteApi.queryTopicCurrentData((resp) => {
            topicBarChartInstance.current?.hideLoading();
            if (resp.status === 0) {
                const topicList = resp.data;
                topicList.sort((first, last) => {
                    const firstTotalMsg = parseFloat(first.split(",")[1] || 0);
                    const lastTotalMsg = parseFloat(last.split(",")[1] || 0);
                    return lastTotalMsg - firstTotalMsg;
                });

                const xAxisData = [];
                const data = [];
                const names = [];

                topicList.forEach((currentData) => {
                    const currentArray = currentData.split(",");
                    names.push(currentArray[0]);
                });
                setTopicNames(names);

                if (names.length > 0 && selectedTopic === null) {
                    setSelectedTopic(names[0]);
                }

                topicList.slice(0, 10).forEach((currentData) => {
                    const currentArray = currentData.split(",");
                    xAxisData.push(currentArray[0]);
                    data.push(parseFloat(currentArray[1] || 0));
                });

                const option = {
                    xAxis: {
                        data: xAxisData,
                        axisLabel: {
                            inside: false,
                            color: '#000000',
                            rotate: 60,
                            interval: 0
                        },
                    },
                    series: [{ name: 'TotalMsg', data: data }]
                };
                topicBarChartInstance.current?.setOption(option);
            } else {
                notification.error({ message: resp.errMsg || t.QUERY_TOPIC_CURRENT_FAILED, duration: 2 });
            }
        });
    }, [selectedTopic, t]);

    useEffect(() => {
        if (barChartInstance.current && lineChartInstance.current && topicBarChartInstance.current && topicLineChartInstance.current) {
            queryLineData();
        }
    }, [date, selectedTopic, queryLineData]);

    useEffect(() => {
        const intervalId = setInterval(queryLineData, tools.dashboardRefreshTime);
        return () => {
            clearInterval(intervalId);
        };
    }, [queryLineData]);

    const brokerColumns = [
        { title: t.BROKER_NAME, dataIndex: 'brokerName', key: 'brokerName' },
        { title: t.BROKER_ADDR, dataIndex: 'brokerAddress', key: 'brokerAddress' },
        {
            title: t.TOTAL_MSG_RECEIVED_TODAY,
            dataIndex: 'msgGetTotalTodayNow',
            key: 'msgGetTotalTodayNow',
            render: (text) => parseFloat(text || 0).toLocaleString(),
            sorter: (a, b) => parseFloat(a.msgGetTotalTodayNow || 0) - parseFloat(b.msgGetTotalTodayNow || 0),
        },
        {
            title: t.TODAY_PRO_COUNT,
            key: 'todayProCount',
            render: (_, record) => parseFloat(record.msgPutTotalTodayMorning || 0).toLocaleString(), // Assuming msgPutTotalTodayMorning is 'today pro count'
        },
        {
            title: t.YESTERDAY_PRO_COUNT,
            key: 'yesterdayProCount',
            // This calculation (today morning - yesterday morning) might not be correct for 'yesterday pro count'.
            // It depends on what msgPutTotalTodayMorning and msgPutTotalYesterdayMorning truly represent.
            // If they are cumulative totals up to morning, then the difference is not accurate for yesterday's count.
            // You might need a specific 'msgPutTotalYesterdayNow' from the backend.
            render: (_, record) => (parseFloat(record.msgPutTotalTodayMorning || 0) - parseFloat(record.msgPutTotalYesterdayMorning || 0)).toLocaleString(),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Spin spinning={loading} tip={t.LOADING}>
                <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={12}>
                        <Card title={t.BROKER_OVERVIEW} bordered>
                            <Table
                                columns={brokerColumns}
                                dataSource={brokerTableData}
                                rowKey="key"
                                pagination={false}
                                size="small"
                                bordered
                                scroll={{ y: 240 }}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={t.DASHBOARD_DATE_SELECTION} bordered>
                            <DatePicker
                                format="YYYY-MM-DD"
                                value={date}
                                onChange={setDate}
                                allowClear
                                style={{ width: '100%' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={12}>
                        <Card title={`${t.BROKER} TOP 10`} bordered>
                            <div ref={barChartRef} style={{ height: 300 }} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={`${t.BROKER} 5min ${t.TREND}`} bordered>
                            <div ref={lineChartRef} style={{ height: 300 }} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card title={`${t.TOPIC} TOP 10`} bordered>
                            <div ref={topicBarChartRef} style={{ height: 300 }} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={`${t.TOPIC} 5min ${t.TREND}`} bordered>
                            <div style={{ marginBottom: '10px' }}>
                                <Select
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder={t.SELECT_TOPIC_PLACEHOLDER}
                                    value={selectedTopic}
                                    onChange={setSelectedTopic}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {topicNames.map(topic => (
                                        <Option key={topic} value={topic}>{topic}</Option>
                                    ))}
                                </Select>
                            </div>
                            <div ref={topicLineChartRef} style={{ height: 300 }} />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default DashboardPage;
