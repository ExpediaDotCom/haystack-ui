/*
 * Copyright 2018 Expedia Group
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

const Q = require('q');
const _ = require('lodash');
const grpc = require('grpc');

const config = require('../../../config/config');
const servicesConnector = require('../../services/servicesConnector');

const fetcher = require('../../operations/grpcFetcher');
const services = require('../../../../static_codegen/anomaly/anomalyReader_grpc_pb');
const messages = require('../../../../static_codegen/anomaly/anomalyReader_pb');
const MetricpointNameEncoder = require('../../utils/encoders/MetricpointNameEncoder');

const metricpointNameEncoder = new MetricpointNameEncoder(config.connectors.trends && config.connectors.trends.encoder);

const grpcOptions = {
    'grpc.max_receive_message_length': 10485760, // todo: do I need these?
    ...config.connectors.traces.grpcOptions
};

const connector = {};
const client = new services.AnomalyReaderClient(
    `${config.connectors.alerts.haystackHost}:${config.connectors.alerts.haystackPort}`,
    grpc.credentials.createInsecure(),
    grpcOptions); // TODO make client secure
const alertTypes = ['durationTP99', 'failureCount'];
const getAnomaliesFetcher = fetcher('getAnomalies', client);
const alertFreqInSec = config.connectors.alerts.alertFreqInSec; // TODO make this based on alert type


function fetchOperations(serviceName) {
    return servicesConnector.getOperations(serviceName);
}

function parseOperationAlertsResponse(data) {
    return data.searchanomalyresponseList.map((anomalyResponse) => {
        const labels = anomalyResponse.labels;

        const operationName = labels.operationName;
        const alertType = labels.alertType;
        const latestUnhealthy = _.maxBy(anomalyResponse.anomalies, anomaly => anomaly.timestamp);

        const isUnhealthy = (latestUnhealthy && latestUnhealthy.timestamp >= (Date.now() - alertFreqInSec));
        const timestamp = latestUnhealthy && latestUnhealthy.timestamp;

        return {
            operationName,
            alertType,
            isUnhealthy,
            timestamp
        };
    });
}

function fetchOperationAlerts(serviceName, interval, from) {
    const request = new messages.SearchAnamoliesRequest();
    request.getLabelsMap()
        .set('serviceName', metricpointNameEncoder.encodeMetricpointName(serviceName))
        .set('interval', interval)
        .set('product', 'haystack')
        .set('mtype', 'gauge');
    request.setStarttime(from);
    request.setEndtime(Date.now());

    return getAnomaliesFetcher
        .fetch(request)
        .then((pbResult) => {
            console.log(messages.SearchAnomaliesResponse.toObject(false, pbResult));
            return parseOperationAlertsResponse(messages.SearchAnomaliesResponse.toObject(false, pbResult));
        });
}

function mergeOperationsWithAlerts({operationAlerts, operations}) {
    return _.flatten(operations.map(operation => alertTypes.map((alertType) => {
        const operationAlert = operationAlerts.find(alert => (alert.operationName.toLowerCase() === operation.toLowerCase() && alert.type === alertType));

        if (operationAlert !== undefined) {
            return {
                ...operationAlert
            };
        }

        return {
            operationName: operation,
            type: alertType,
            isUnhealthy: false,
            timestamp: null
        };
    })));
}

function returnAnomalies(data) {
    if (!data || !data.length || !data[0].length) {
        return [];
    }

    return data[0].anomalies;
}

function getActiveAlertCount(operationAlerts) {
    return operationAlerts.filter(opAlert => opAlert.isUnhealthy).length;
}

connector.getServiceAlerts = (serviceName, query) => {
    Q.all([fetchOperations(serviceName), fetchOperationAlerts(serviceName, query.interval, Math.trunc(query.from / 1000), Math.trunc(query.until / 1000))])
        .then(stats => mergeOperationsWithAlerts({
                operations: stats[0],
                operationAlerts: stats[1]
            })
        );
};

connector.getAnomalies = (serviceName, operationName, alertType, from, interval) => {
    const stat = alertType === 'failure-span' ? 'count' : '*_99';

    const request = new messages.SearchAnamoliesRequest();
    request.getLabelsMap()
        .set('serviceName', metricpointNameEncoder.encodeMetricpointName(serviceName))
        .set('operationName', metricpointNameEncoder.encodeMetricpointName(operationName))
        .set('name', alertType)
        .set('stat', stat)
        .set('interval', interval)
        .set('product', 'haystack')
        .set('mtype', 'gauge');
    request.setStarttime(from);
    request.setEndtime(Date.now());

    return getAnomaliesFetcher
        .fetch(request)
        .then(pbResult => returnAnomalies(messages.SearchAnomaliesResponse.toObject(false, pbResult)));
};

connector.getServiceUnhealthyAlertCount = serviceName =>
    fetchOperationAlerts(serviceName, Math.trunc((Date.now() / 1000) - (5 * 60)), Math.trunc(Date.now() / 1000))
        .then(result => getActiveAlertCount(result));

module.exports = connector;
