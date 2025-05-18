import React, { useEffect, useRef } from 'react';
import { Form, Input, Typography, Collapse, Table } from 'antd';
import moment from 'moment';
import { useLanguage } from '../i18n/LanguageContext';
import Paragraph from "antd/es/skeleton/Paragraph"; // 根据实际路径调整
// 引入 D3 或 G6 等图表库，用于绘制消息轨迹图
// import * as d3 from 'd3'; // 如果使用D3
// import G6 from '@antv/g6'; // 如果使用G6

const { Text } = Typography;
const { Panel } = Collapse;

const MessageTraceDetailViewDialog = ({ ngDialogData }) => {
    const { t } = useLanguage();
    const messageTraceGraphRef = useRef(null);

    const producerNode = ngDialogData?.producerNode;
    const subscriptionNodeList = ngDialogData?.subscriptionNodeList || [];

    useEffect(() => {
        // 在这里初始化和绘制消息轨迹图
        // 这部分需要根据你选择的图表库（如 D3, G6, ECharts 等）来具体实现
        // 示例伪代码（使用 D3 或 G6 等库需要引入对应的库文件）
        if (messageTraceGraphRef.current && ngDialogData) {
            console.log("绘制消息轨迹图:", ngDialogData);
            // 假设这里是使用 G6 的简单示例
            // const graph = new G6.Graph({
            //     container: messageTraceGraphRef.current,
            //     width: 1024,
            //     height: 500,
            //     layout: {
            //         type: 'dagre',
            //         rankdir: 'LR',
            //         nodesep: 30,
            //         ranksep: 100,
            //     },
            //     defaultNode: {
            //         type: 'rect',
            //         size: [120, 40],
            //         style: {
            //             fill: '#F3F4F6',
            //             stroke: '#E2E8F0',
            //             radius: 4,
            //         },
            //         labelCfg: {
            //             style: {
            //                 fill: '#000',
            //                 fontSize: 12,
            //             },
            //         },
            //     },
            //     defaultEdge: {
            //         type: 'line',
            //         style: {
            //             stroke: '#A1A1AA',
            //             endArrow: true,
            //         },
            //     },
            //     modes: {
            //         default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
            //     },
            // });

            // const nodes = [];
            // const edges = [];

            // if (producerNode) {
            //     nodes.push({
            //         id: 'producer',
            //         label: `Producer\n${producerNode.groupName}`,
            //     });
            //     // Add edges from producer to consumer groups or topics if needed
            // }

            // subscriptionNodeList.forEach(subNode => {
            //     nodes.push({
            //         id: `consumer_${subNode.subscriptionGroup}`,
            //         label: `Consumer\n${subNode.subscriptionGroup}`,
            //     });
            //     if (producerNode) {
            //         edges.push({
            //             source: 'producer',
            //             target: `consumer_${subNode.subscriptionGroup}`,
            //             label: 'Consume'
            //         });
            //     }
            // });

            // graph.data({ nodes, edges });
            // graph.render();

            // return () => {
            //     graph.destroy(); // 组件卸载时销毁图表
            // };
            // 这里可以替换成实际的图表绘制代码
        }
    }, [ngDialogData]); // 依赖 ngDialogData，当数据变化时重新绘制图表

    const transactionColumns = [
        { title: 'Timestamp', dataIndex: 'beginTimestamp', key: 'beginTimestamp', align: 'center', render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss.SSS') },
        { title: 'TransactionState', dataIndex: 'transactionState', key: 'transactionState', align: 'center' },
        { title: 'FromTransactionCheck', dataIndex: 'fromTransactionCheck', key: 'fromTransactionCheck', align: 'center', render: (text) => (text ? t.YES : t.NO) },
        { title: 'ClientHost', dataIndex: 'clientHost', key: 'clientHost', align: 'center' },
        { title: 'StoreHost', dataIndex: 'storeHost', key: 'storeHost', align: 'center' },
    ];

    const consumeColumns = [
        { title: 'BeginTimestamp', dataIndex: 'beginTimestamp', key: 'beginTimestamp', align: 'center', render: (text) => text < 0 ? 'N/A' : moment(text).format('YYYY-MM-DD HH:mm:ss.SSS') },
        { title: 'EndTimestamp', dataIndex: 'endTimestamp', key: 'endTimestamp', align: 'center', render: (text) => text < 0 ? 'N/A' : moment(text).format('YYYY-MM-DD HH:mm:ss.SSS') },
        { title: 'CostTime', dataIndex: 'costTime', key: 'costTime', align: 'center', render: (text) => text < 0 ? 'N/A' : `${text === 0 ? '<1' : text}ms` },
        { title: 'Status', dataIndex: 'status', key: 'status', align: 'center' },
        { title: 'RetryTimes', dataIndex: 'retryTimes', key: 'retryTimes', align: 'center', render: (text) => text < 0 ? 'N/A' : text },
        { title: 'ClientHost', dataIndex: 'clientHost', key: 'clientHost', align: 'center' },
        { title: 'StoreHost', dataIndex: 'storeHost', key: 'storeHost', align: 'center' },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Collapse defaultActiveKey={['messageTraceGraph']} ghost>
                    <Panel header={<Typography.Title level={3} style={{ margin: 0 }}>{t.MESSAGE_TRACE_GRAPH}</Typography.Title>} key="messageTraceGraph">
                        <div ref={messageTraceGraphRef} style={{ height: 500, width: '100%', border: '1px solid #f0f0f0' }}>
                            {/* 消息轨迹图将在这里绘制 */}
                            <Text type="secondary">{t.TRACE_GRAPH_PLACEHOLDER}</Text>
                        </div>
                    </Panel>
                </Collapse>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <Collapse defaultActiveKey={['sendMessageTrace']} ghost>
                    <Panel header={<Typography.Title level={3} style={{ margin: 0 }}>{t.SEND_MESSAGE_TRACE}</Typography.Title>} key="sendMessageTrace">
                        {!producerNode ? (
                            <Paragraph>{t.NO_PRODUCER_TRACE_DATA}</Paragraph>
                        ) : (
                            <div>
                                <Typography.Title level={4}>
                                    {t.SEND_MESSAGE_INFO} : ( {t.MESSAGE_ID} <b>{producerNode.msgId}</b> )
                                </Typography.Title>
                                <Form layout="vertical" colon={false}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        <Form.Item label="Topic" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.topic} readOnly />
                                        </Form.Item>
                                        <Form.Item label="ProducerGroup" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.groupName} readOnly />
                                        </Form.Item>
                                        <Form.Item label="Message Key" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.keys} readOnly />
                                        </Form.Item>
                                        <Form.Item label="Tag" style={{ flex: '0 0 25%' }}>
                                            <Input value={producerNode.tags} readOnly />
                                        </Form.Item>

                                        <Form.Item label="BeginTimestamp" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={moment(producerNode.traceNode.beginTimestamp).format('YYYY-MM-DD HH:mm:ss.SSS')} readOnly />
                                        </Form.Item>
                                        <Form.Item label="EndTimestamp" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={moment(producerNode.traceNode.endTimestamp).format('YYYY-MM-DD HH:mm:ss.SSS')} readOnly />
                                        </Form.Item>
                                        <Form.Item label="CostTime" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={`${producerNode.traceNode.costTime === 0 ? '<1' : producerNode.traceNode.costTime}ms`} readOnly />
                                        </Form.Item>
                                        <Form.Item label="MsgType" style={{ flex: '0 0 25%' }}>
                                            <Input value={producerNode.traceNode.msgType} readOnly />
                                        </Form.Item>

                                        <Form.Item label="ClientHost" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.traceNode.clientHost} readOnly />
                                        </Form.Item>
                                        <Form.Item label="StoreHost" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.traceNode.storeHost} readOnly />
                                        </Form.Item>
                                        <Form.Item label="RetryTimes" style={{ flex: '0 0 25%', paddingRight: '10px' }}>
                                            <Input value={producerNode.traceNode.retryTimes} readOnly />
                                        </Form.Item>
                                        <Form.Item label="OffSetMsgId" style={{ flex: '0 0 25%' }}>
                                            <Input value={producerNode.offSetMsgId} readOnly />
                                        </Form.Item>
                                    </div>
                                </Form>

                                {producerNode.transactionNodeList && producerNode.transactionNodeList.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <Typography.Title level={4}>{t.CHECK_TRANSACTION_INFO}:</Typography.Title>
                                        <Table
                                            columns={transactionColumns}
                                            dataSource={producerNode.transactionNodeList}
                                            rowKey={(record, index) => index} // 事务节点可能没有唯一ID
                                            bordered
                                            pagination={false}
                                            size="small"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </Panel>
                </Collapse>
            </div>

            <div>
                <Collapse defaultActiveKey={['consumeMessageTrace']} ghost>
                    <Panel header={<Typography.Title level={3} style={{ margin: 0 }}>{t.CONSUME_MESSAGE_TRACE}</Typography.Title>} key="consumeMessageTrace">
                        {subscriptionNodeList.length === 0 ? (
                            <Paragraph>{t.NO_CONSUMER_TRACE_DATA}</Paragraph>
                        ) : (
                            subscriptionNodeList.map(subscriptionNode => (
                                <Collapse key={subscriptionNode.subscriptionGroup} style={{ marginBottom: '10px' }} defaultActiveKey={[subscriptionNode.subscriptionGroup]} ghost>
                                    <Panel header={<Typography.Title level={3} style={{ margin: 0 }}>{t.SUBSCRIPTION_GROUP}: {subscriptionNode.subscriptionGroup}</Typography.Title>} key={subscriptionNode.subscriptionGroup}>
                                        <Table
                                            columns={consumeColumns}
                                            dataSource={subscriptionNode.consumeNodeList}
                                            rowKey={(record, index) => `${subscriptionNode.subscriptionGroup}_${index}`}
                                            bordered
                                            pagination={false}
                                            size="small"
                                        />
                                    </Panel>
                                </Collapse>
                            ))
                        )}
                    </Panel>
                </Collapse>
            </div>
        </div>
    );
};

export default MessageTraceDetailViewDialog;
