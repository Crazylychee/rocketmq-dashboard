import React from 'react';
import { Select, Table, Input, Button } from 'antd';
import { useLanguage } from "../../i18n/LanguageContext";

const { Option } = Select;

const DeployHistoryList = ({ allTopicList = [], selectedTopic, setSelectedTopic, producerGroup, setProducerGroup, connectionList = [], queryClientByTopicAndGroup }) => {
    const { t } = useLanguage();

    const columns = [
        {
            title: 'clientId',
            dataIndex: 'clientId',
            key: 'clientId',
            align: 'center',
        },
        {
            title: 'clientAddr',
            dataIndex: 'clientAddr',
            key: 'clientAddr',
            align: 'center',
        },
        {
            title: 'language',
            dataIndex: 'language',
            key: 'language',
            align: 'center',
        },
        {
            title: 'version',
            dataIndex: 'versionDesc',
            key: 'versionDesc',
            align: 'center',
        },
    ];

    return (
        <div className="container-fluid" id="deployHistoryList" role="main">
            <form className="form-inline pull-left col-sm-12">
                <div className="form-group">
                    <label>{t.TOPIC}:</label>
                    <Select
                        style={{width: 300}}
                        value={selectedTopic}
                        onChange={setSelectedTopic}
                        placeholder={t.SELECT_TOPIC}
                        required
                    >
                        <Option value="">请选择</Option>
                        {allTopicList.map((item, index) => (
                            <Option key={index} value={item}>{item}</Option>
                        ))}
                    </Select>

                    <label htmlFor="producerGroup">{t.PRODUCER_GROUP}:</label>
                    <Input
                        id="ProducerGroup"
                        style={{width: 300}}
                        type="text"
                        value={producerGroup}
                        onChange={(e) => setProducerGroup(e.target.value)}
                        required
                    />
                    <Button type="primary" onClick={queryClientByTopicAndGroup}>
                        <span className="glyphicon glyphicon-search"></span>{t.SEARCH}
                    </Button>
                </div>

            </form>
            <Table
                columns={columns}
                dataSource={connectionList}
                rowKey="clientId"
                pagination={false}
            />
        </div>
    );
};

export default DeployHistoryList;
