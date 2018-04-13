/*
 * Copyright 2018 Expedia, Inc.
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

const trendsConnector = require(`../../trends/${config.connectors.trends.connectorName}/trendsConnector`); // eslint-disable-line import/no-dynamic-require

const fetcher = require('../../fetchers/restFetcher');

const alertHistoryFetcher = fetcher('alertHistory');
const serviceAlertsFetcher = fetcher('serviceAlerts');

const connector = {};
const metricTankUrl = config.connectors.alerts.metricTankUrl;
const coolOffPeriod = 5 * 60; // TODO make this based on alert type

const alertTypes = ['durationTP99'];

function fetchOperations(serviceName) {
    return servicesConnector.getOperations(serviceName);
}

function fetchOperationTrends(serviceName, granularity, from, until) {
    return trendsConnector.getOperationStats(serviceName, granularity, from, until);
}

function toMetricTankEncodedName(name) {
    return new MetricpointNameEncoder().encodeMetricpointName(name);
}

function fromMetricTankTarget(name) {
    return new MetricpointNameEncoder().decodeMetricpointName(name);
}

function parseOperationAlertsResponse(data, until) {
    return data.map((op) => {
        const targetSplit = op.target.split('.');

        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const alertTypeIndex = targetSplit.indexOf('alertType');
        const operationName = fromMetricTankTarget(targetSplit[operationNameTagIndex + 1]);
        const type = fromMetricTankTarget(targetSplit[alertTypeIndex + 1]);
        const latestUnhealthy = _.maxBy(op.datapoints.filter(p => p[0]), p => p[1]);

        const isUnhealthy = (latestUnhealthy && latestUnhealthy[1] >= (until - coolOffPeriod));
        const timestamp = latestUnhealthy && latestUnhealthy[1] * 1000 * 1000;

        return {
            operationName,
            type,
            isUnhealthy,
            timestamp
        };
    });
}

function fetchOperationAlerts(serviceName, from, until) {
    const target = `haystack.serviceName.${serviceName}.operationName.*.alertType.*.anomaly`;

    return serviceAlertsFetcher
        .fetch(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`)
        .then(result => parseOperationAlertsResponse(result, until));
}

function mergeOperationAlertsAndTrends({operationAlerts, operations, operationTrends}) {
    const alertTypeToTrendMap = {
        count: 'countPoints',
        durationTP99: 'tp99DurationPoints',
        failureCount: 'failurePoints'
    };

    return _.flatten(operations.map(operation => alertTypes.map((alertType) => {
        const operationAlert = operationAlerts.find(alert => (alert.operationName.toLowerCase() === operation.toLowerCase() && alert.type === alertType));
        const operationTrend = operationTrends.find(trend => (trend.operationName.toLowerCase() === operation.toLowerCase()));

        if (operationAlert !== undefined) {
            return {
                ...operationAlert,
                trend: operationTrend ? operationTrend[alertTypeToTrendMap[alertType]] : []
            };
        }

        return {
            operationName: operation,
            type: alertType,
            isUnhealthy: false,
            timestamp: null,
            trend: operationTrend ? operationTrend[alertTypeToTrendMap[alertType]] : []
        };
    })));
}

function parseAlertDetailResponse(data) {
    if (!data || !data.length) {
        return [];
    }

    const sortedUnhealthyPoints = data[0].datapoints.filter(p => p[0]).sort((a, b) => a[1] - b[1]);

    return sortedUnhealthyPoints.map(point => ({
        startTimestamp: point[1] * 1000 * 1000,
        endTimestamp: (point[1] * 1000 * 1000) + (5 * 60 * 1000 * 1000) // TODO make this based on alert type
    }));
}

function getActiveAlertCount(operationAlerts) {
    return operationAlerts.filter(opAlert => opAlert.isUnhealthy).length;
}

connector.getServiceAlerts = (serviceName, query) => {
    const { granularity, from, until} = query;

    return Q
        .all([fetchOperations(serviceName), fetchOperationAlerts(serviceName, Math.trunc(from / 1000), Math.trunc(until / 1000)), fetchOperationTrends(serviceName, granularity, from, until)])
        .then(stats => mergeOperationAlertsAndTrends({
                operations: stats[0],
                operationAlerts: stats[1],
                operationTrends: stats[2]
            })
        );
};

connector.getAlertDetails = (serviceName, operationName, alertType) => {
    const target = `haystack.serviceName.${serviceName}.operationName.${toMetricTankEncodedName(operationName)}.alertType.${alertType}.anomaly`;

    return alertHistoryFetcher
        .fetch(`${metricTankUrl}/render?target=${target}`)
        .then(result => parseAlertDetailResponse(result));
};

// no-op for now, TODO add the metrictank read logic
connector.getServiceUnhealthyAlertCount = serviceName =>
    fetchOperationAlerts(serviceName, Math.trunc((Date.now() / 1000) - (5 * 60)), Math.trunc(Date.now() / 1000))
        .then(result => getActiveAlertCount(result));

module.exports = connector;
