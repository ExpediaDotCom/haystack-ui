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

const config = require('../../../config/config');
const servicesConnector = require('../../services/servicesConnector');
const MetricpointNameEncoder = require('../../utils/encoders/MetricpointNameEncoder');

const fetcher = require('../../operations/restFetcher');

const alertHistoryFetcher = fetcher('alertHistory');
const serviceAlertsFetcher = fetcher('serviceAlerts');

const connector = {};
const metricTankUrl = config.connectors.alerts.metricTankUrl;
const metricpointNameEncoder = new MetricpointNameEncoder(config.connectors.trends.encoder);
const alertTypes = ['durationTP99', 'failureCount'];
const alertFreqInSec = config.connectors.alerts.alertFreqInSec; // TODO make this based on alert type
const alertMergeBufferTimeInSec = config.connectors.alerts.alertMergeBufferTimeInSec;


function fetchOperations(serviceName) {
    return servicesConnector.getOperations(serviceName);
}

function parseOperationAlertsResponse(data, until) {
    return data.map((op) => {
        const tags = op.tags;

        const operationName = tags.operationName;
        const alertType = metricpointNameEncoder.decodeMetricpointName(tags.alertType);
        const latestUnhealthy = _.maxBy(op.datapoints.filter(p => p[0]), p => p[1]);

        const isUnhealthy = (latestUnhealthy && latestUnhealthy[1] >= (until - alertFreqInSec));
        const timestamp = latestUnhealthy && latestUnhealthy[1] * 1000 * 1000;

        return {
            operationName,
            alertType,
            isUnhealthy,
            timestamp
        };
    });
}

function fetchOperationAlerts(serviceName, from, until) {
    const target = encodeURIComponent(`seriesByTag('name=anomaly','serviceName=${serviceName}','operationName=~.*','alertType=~.*')`);

    return serviceAlertsFetcher
        .fetch(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`)
        .then(result => parseOperationAlertsResponse(result, until));
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

function mergeSuccessiveAlertPoints(unhealthyPoints) {
    const sortedUnhealthyPoints = _.sortBy(unhealthyPoints, alertPoint => alertPoint.startTimestamp);
    const mergedAlertHistory = [sortedUnhealthyPoints.shift()];  // pop first element
    _.forEach(sortedUnhealthyPoints, (nextAlertPoint) => {
        const lastPointOfResult = mergedAlertHistory[mergedAlertHistory.length - 1];
        if (nextAlertPoint.startTimestamp - lastPointOfResult.endTimestamp <= alertMergeBufferTimeInSec * 1000 * 1000) {
            mergedAlertHistory[mergedAlertHistory.length - 1].endTimestamp = nextAlertPoint.endTimestamp;
        } else {
            mergedAlertHistory.push(nextAlertPoint);
        }
    });
    return mergedAlertHistory;
}

function parseAlertDetailResponse(data) {
    if (!data || !data.length) {
        return [];
    }

    const unhealthyTimestamps = data[0].datapoints.filter(p => p[0]);

    const unhealthyPoints = unhealthyTimestamps.map(point => ({
        startTimestamp: point[1] * 1000 * 1000,
        endTimestamp: (point[1] * 1000 * 1000) + (5 * 60 * 1000 * 1000) // TODO make this based on alert type
    }));

    return mergeSuccessiveAlertPoints(unhealthyPoints);
}

function getActiveAlertCount(operationAlerts) {
    return operationAlerts.filter(opAlert => opAlert.isUnhealthy).length;
}

connector.getServiceAlerts = (serviceName, query) => {
    Q.all([fetchOperations(serviceName), fetchOperationAlerts(serviceName, Math.trunc(query.from / 1000), Math.trunc(query.until / 1000))])
        .then(stats => mergeOperationsWithAlerts({
                operations: stats[0],
                operationAlerts: stats[1]
            })
        );
};

connector.getAlertHistory = (serviceName, operationName, alertType, from) => {
    const target = encodeURIComponent(`seriesByTag('name=anomaly','serviceName=${serviceName}','operationName=${metricpointNameEncoder.encodeMetricpointName(operationName)}','alertType=${alertType}')`);

    return alertHistoryFetcher
        .fetch(`${metricTankUrl}/render?target=${target}&from=${Math.trunc(from / 1000)}&to=${Math.trunc(Date.now() / 1000)}`)
        .then(result => parseAlertDetailResponse(result));
};

connector.getServiceUnhealthyAlertCount = serviceName =>
    fetchOperationAlerts(serviceName, Math.trunc((Date.now() / 1000) - (5 * 60)), Math.trunc(Date.now() / 1000))
        .then(result => getActiveAlertCount(result));

module.exports = connector;
