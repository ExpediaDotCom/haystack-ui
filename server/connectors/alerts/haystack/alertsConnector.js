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
const servicesConnector = config.connectors.traces && require('../../services/servicesConnector'); // eslint-disable-line

const fetcher = require('../../operations/grpcFetcher');
const services = require('../../../../static_codegen/anomaly/anomalyReader_grpc_pb');
const messages = require('../../../../static_codegen/anomaly/anomalyReader_pb');
const MetricpointNameEncoder = require('../../utils/encoders/MetricpointNameEncoder');

const metricpointNameEncoder = new MetricpointNameEncoder(config.encoder);

const grpcOptions = config.grpcOptions || {};

const connector = {};
const client = new services.AnomalyReaderClient(
    `${config.connectors.alerts.haystackHost}:${config.connectors.alerts.haystackPort}`,
    grpc.credentials.createInsecure(),
    grpcOptions); // TODO make client secure
const alertTypes = ['durationTP99', 'failureCount'];
const getAnomaliesFetcher = fetcher('getAnomalies', client);
const alertFreqInSec = config.connectors.alerts.alertFreqInSec; // TODO make this based on alert type


function fetchOperations(serviceName) {
    return servicesConnector && servicesConnector.getOperations(serviceName);
    }

function parseOperationAlertsResponse(data) {
    return data.searchanomalyresponseList.map((anomalyResponse) => {
        const labels = anomalyResponse.labelsMap;

        const operationName = labels.find(label => label[0] === 'operationName');
        const stat = labels.find(label => label[0] === 'stat');

        let alertType;
        if (stat && stat[1] === '*_99') {
            alertType = 'durationTP99';
        } else if (stat && stat[1] === 'count') {
            alertType = 'failureCount';
        }
        if (operationName && alertType) {
            const latestUnhealthy = _.maxBy(anomalyResponse.anomaliesList, anomaly => anomaly.timestamp);

            const isUnhealthy = (latestUnhealthy && latestUnhealthy.timestamp >= (Date.now() - alertFreqInSec));
            const timestamp = latestUnhealthy && latestUnhealthy.timestamp;
            return {
                operationName: operationName[1],
                alertType,
                isUnhealthy,
                timestamp
            };
        }
        return null;
    });
}

function fetchOperationAlerts(serviceName, interval, from) {
    const request = new messages.SearchAnamoliesRequest();
    request.getLabelsMap()
        .set('serviceName', metricpointNameEncoder.encodeMetricpointName(decodeURIComponent(serviceName)))
        .set('interval', interval)
        .set('mtype', 'gauge')
        .set('product', 'haystack');
    request.setStarttime(Math.trunc(from / 1000));
    request.setEndtime(Math.trunc(Date.now() / 1000));
    request.setSize(-1);

    return getAnomaliesFetcher
        .fetch(request)
        .then(pbResult => parseOperationAlertsResponse(messages.SearchAnomaliesResponse.toObject(false, pbResult)));
}

function mergeOperationsWithAlerts({operationAlerts, operations}) {
    if (operations) {
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

    return alertTypes.map(alertType => (operationAlerts.filter(alert => (alert.alertType === alertType))));
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

connector.getServiceAlerts = (serviceName, interval) => {
    // todo: calculate "from" value based on selected interval
    const oneDayAgo = Math.trunc((Date.now() - (24 * 60 * 60 * 1000)));
    return Q.all([fetchOperations(serviceName), fetchOperationAlerts(serviceName, interval, oneDayAgo)])
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
        .set('serviceName', metricpointNameEncoder.encodeMetricpointName(decodeURIComponent(serviceName)))
        .set('operationName', metricpointNameEncoder.encodeMetricpointName(decodeURIComponent(operationName)))
        .set('product', 'haystack')
        .set('name', alertType)
        .set('stat', stat)
        .set('interval', interval)
        .set('mtype', 'gauge');
    request.setStarttime(Math.trunc(from / 1000));
    request.setEndtime(Math.trunc(Date.now() / 1000));
    request.setSize(-1);

    return getAnomaliesFetcher
        .fetch(request)
        .then(pbResult => returnAnomalies(messages.SearchAnomaliesResponse.toObject(false, pbResult)));
};

connector.getServiceUnhealthyAlertCount = serviceName =>
    fetchOperationAlerts(serviceName, 'FiveMinute', Math.trunc((Date.now() - (5 * 60 * 1000))))
        .then(result => getActiveAlertCount(result));

module.exports = connector;
