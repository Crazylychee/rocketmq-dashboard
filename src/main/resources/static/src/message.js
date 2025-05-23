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

var module = app;

module.controller('messageController', ['$scope', 'ngDialog', '$http', 'Notification', function ($scope, ngDialog, $http, Notification) {
    $scope.allTopicList = [];
    $scope.selectedTopic = [];
    $scope.key = "";
    $scope.messageId = "";
    $scope.queryMessageByTopicResult = [];
    $scope.queryMessageByTopicAndKeyResult = [];
    $scope.queryMessageByMessageIdResult = {};
    $http({
        method: "GET",
        url: "topic/list.query",
        params: {
            skipSysProcess: true
        }
    }).success(function (resp) {
        if (resp.status == 0) {
            $scope.allTopicList = resp.data.topicList.sort();
            console.log($scope.allTopicList);
        } else {
            Notification.error({message: resp.errMsg, delay: 2000});
        }
    });
    $scope.timepickerBegin = moment().subtract(3, 'hour').format('YYYY-MM-DD HH:mm');
    $scope.timepickerEnd = moment().format('YYYY-MM-DD HH:mm');
    $scope.timepickerOptions = {format: 'YYYY-MM-DD HH:mm', showClear: true};

    $scope.taskId = "";

    $scope.paginationConf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 20,
        pagesLength: 15,
        perPageOptions: [10],
        rememberPerPage: 'perPageItems',
        onChange: function () {
            $scope.queryMessagePageByTopic()
        }
    };

    $scope.queryMessagePageByTopic = function () {
        $("#noMsgTip").css("display", "none");
        if ($scope.timepickerEnd < $scope.timepickerBegin) {
            Notification.error({message: "endTime is later than beginTime!", delay: 2000});
            return
        }
        if ($scope.selectedTopic === [] || (typeof $scope.selectedTopic) == "object") {
            return
        }
        $http({
            method: "POST",
            url: "message/queryMessagePageByTopic.query",
            data: {
                topic: $scope.selectedTopic,
                begin: $scope.timepickerBegin.valueOf(),
                end: $scope.timepickerEnd.valueOf(),
                pageNum: $scope.paginationConf.currentPage,
                pageSize: $scope.paginationConf.itemsPerPage,
                taskId: $scope.taskId
            }
        }).success(function (resp) {
            if (resp.status === 0) {
                console.log(resp);
                $scope.messageShowList = resp.data.page.content;
                if ($scope.messageShowList.length == 0){
                    $("#noMsgTip").removeAttr("style");
                }
                if (resp.data.page.first) {
                    $scope.paginationConf.currentPage = 1;
                }
                $scope.paginationConf.currentPage = resp.data.page.number + 1;
                $scope.paginationConf.totalItems = resp.data.page.totalElements;
                $scope.taskId = resp.data.taskId
            } else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    }

    $scope.queryMessageByTopic = function () {
        console.log($scope.selectedTopic);
        console.log($scope.timepickerBegin)
        console.log($scope.timepickerEnd)
        if ($scope.timepickerEnd < $scope.timepickerBegin) {
            Notification.error({message: "endTime is later than beginTime!", delay: 2000});
            return
        }

        $http({
            method: "GET",
            url: "message/queryMessageByTopic.query",
            params: {
                topic: $scope.selectedTopic,
                begin: $scope.timepickerBegin.valueOf(),
                end: $scope.timepickerEnd.valueOf()

            }
        }).success(function (resp) {
            if (resp.status == 0) {
                console.log(resp);
                $scope.queryMessageByTopicResult = resp.data;
                $scope.changeShowMessageList(1, $scope.queryMessageByTopicResult.length);
                // todo
                // console.log($scope.queryMessageByTopicResult);
            } else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };

    $scope.queryMessageByTopicAndKey = function () {
        console.log($scope.selectedTopic);
        console.log($scope.key);
        $http({
            method: "GET",
            url: "message/queryMessageByTopicAndKey.query",
            params: {
                topic: $scope.selectedTopic,
                key: $scope.key
            }
        }).success(function (resp) {
            if (resp.status == 0) {
                console.log(resp);
                $scope.queryMessageByTopicAndKeyResult = resp.data;
                console.log($scope.queryMessageByTopicAndKeyResult);
            } else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };

    $scope.queryMessageByBrokerAndOffset = function (storeHost, commitLogOffset) {
        $http({
            method: "GET",
            url: "message/viewMessageByBrokerAndOffset.query",
            params: {
                brokerHost: storeHost.address,
                port: storeHost.port,
                offset: commitLogOffset
            }
        }).success(function (resp) {
            if (resp.status == 0) {
                console.log(resp);
                ngDialog.open({
                    template: 'messageDetailViewDialog',
                    controller: 'messageDetailViewDialogController',
                    data: resp.data
                });
            } else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };

    $scope.queryMessageByMessageId = function (messageId, topic) {
        $http({
            method: "GET",
            url: "message/viewMessage.query",
            params: {
                msgId: messageId,
                topic: topic
            }
        }).success(function (resp) {
            if (resp.status == 0) {
                console.log(resp);
                ngDialog.open({
                    template: 'messageDetailViewDialog',
                    controller: 'messageDetailViewDialogController',
                    data: resp.data
                });
            } else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };

    $scope.changeShowMessageList = function (currentPage, totalItem) {
        var perPage = $scope.paginationConf.itemsPerPage;
        var from = (currentPage - 1) * perPage;
        var to = (from + perPage) > totalItem ? totalItem : from + perPage;
        $scope.messageShowList = $scope.queryMessageByTopicResult.slice(from, to);
        $scope.paginationConf.totalItems = totalItem;
    };

    $scope.onChangeQueryCondition = function () {
        console.log("change")
        $scope.taskId = "";
        $scope.paginationConf.currentPage = 1;
        $scope.paginationConf.totalItems = 0;
    }
}]);

module.controller('messageDetailViewDialogController', ['$scope', 'ngDialog', '$http', 'Notification', function ($scope, ngDialog, $http, Notification) {
        $scope.messageTrackList = $scope.ngDialogData.messageTrackList;
        $scope.messageTrackShowList = $scope.ngDialogData.messageTrackList;
        $scope.resendMessage = function (messageView, consumerGroup) {
            var topic = messageView.topic;
            var msgId = messageView.msgId;
            console.log('===' + topic + '===' + msgId);
            if (topic.startsWith('%DLQ%')) {
                if (messageView.properties.hasOwnProperty("RETRY_TOPIC")) {
                    topic = messageView.properties.RETRY_TOPIC;
                }
                if (messageView.properties.hasOwnProperty("ORIGIN_MESSAGE_ID")) {
                    msgId = messageView.properties.ORIGIN_MESSAGE_ID;
                }

            }
            console.log('===' + topic + '===' + msgId);
            $http({
                method: "POST",
                url: "message/consumeMessageDirectly.do",
                params: {
                    msgId: msgId,
                    consumerGroup: consumerGroup,
                    topic: topic
                }
            }).success(function (resp) {
                if (resp.status == 0) {
                    ngDialog.open({
                        template: 'operationResultDialog',
                        data: {
                            result: resp.data
                        }
                    });
                } else {
                    ngDialog.open({
                        template: 'operationResultDialog',
                        data: {
                            result: resp.errMsg
                        }
                    });
                }
            });
        };
        $scope.showExceptionDesc = function (errmsg) {
            if (errmsg == null) {
                errmsg = "Don't have Exception"
            }
            ngDialog.open({
                template: 'operationResultDialog',
                data: {
                    result: errmsg
                }
            });
        };

        $scope.filterConsumerGroup = "";
        $scope.$watch('filterConsumerGroup', function () {
            const lowExceptStr = $scope.filterConsumerGroup.toLowerCase();
            const canShowList = [];

            $scope.messageTrackList.forEach(function (element) {
                if (element.consumerGroup.toLowerCase().indexOf(lowExceptStr) != -1) {
                    canShowList.push(element);
                }
            });
            $scope.messageTrackShowList = canShowList;
        });
    }]
);
