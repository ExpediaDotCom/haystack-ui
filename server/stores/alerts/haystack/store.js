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

const axios = require('axios');
const Q = require('q');
const _ = require('lodash');

const config = require('../../../config/config');
const cache = require('../../../routes/utils/cache');

const traceStore = require(`../../traces/${config.stores.traces.storeName}/store`); // eslint-disable-line import/no-dynamic-require
const trendStore = require(`../../trends/${config.stores.trends.storeName}/store`); // eslint-disable-line import/no-dynamic-require

const errorConverter = require('../../utils/errorConverter');
const logger = require('../../../support/logger').withIdentifier('support:haystack_trends');

const store = {};
const metricTankUrl = config.stores.alerts.metricTankUrl;

const alertTypes = ['count', 'durationTp99', 'failureCount'];

function fetchOperations(serviceName) {
    const deferred = Q.defer();
    const cachedOps = cache.get(`/api/operations?serviceName=${serviceName}`);

    if (cachedOps) {
        deferred.resolve(cachedOps);
    } else {
        deferred.resolve(traceStore.getOperations(serviceName));
    }

    return deferred.promise;
}

function fetchOperationTrends(serviceName, granularity, from, until) {
    const deferred = Q.defer();

    deferred.resolve(trendStore.getOperationStats(serviceName, granularity, from, until));

    return deferred.promise;
}

function toMetricTankOperationName(operationName) {
    return operationName.replace(/\./gi, '___');
}

function fromMetricTankTarget(operationName) {
    return operationName.replace(/___/gi, '.');
}

function parseOperationAlertsResponse(data) {
    const parsedData = [];

    data.forEach((op) => {
        const targetSplit = op.target.split('.');

        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const alertTypeIndex = targetSplit.indexOf('alertType');
        const operationName = fromMetricTankTarget(targetSplit[operationNameTagIndex + 1]);
        const type = fromMetricTankTarget(targetSplit[alertTypeIndex + 1]);

        const latestDatapoint = op.datapoints.sort((a, b) => b[1] - a[1])[0];
        const isUnhealthy = (latestDatapoint[0] === 1);

        let timestamp = latestDatapoint[1] * 1000 * 1000;
        if (!isUnhealthy) {
            const latestUnhealthy = op.datapoints.find(x => x[0]).sort((a, b) => b[1] - a[1]);
            timestamp = latestUnhealthy[1] * 1000 * 1000;
        }

        parsedData.push({
            operationName,
            type,
            isUnhealthy,
            timestamp
        });
    });

    return parsedData;
}

function fetchOperationAlerts(serviceName) {
    const deferred = Q.defer();

    const target = `alertType.*.operationName.*.serviceName.${serviceName}.anomaly`;
    axios
        .get(`${metricTankUrl}/render?target=${target}`)
        .then(response => deferred.resolve(parseOperationAlertsResponse(response.data)), error => deferred.reject(new Error(error)))
        .catch(error => logger.log(errorConverter.fromAxiosError(error)));

    return deferred.promise;
}

function mergeOperationAlertsAndTrends({operationAlerts, operations, operationTrends}) {
    const alertTypeToTrendMap = {
        count: 'countPoints',
        durationTp99: 'tp99DurationPoints',
        failureCount: 'failurePoints'
    };

    return _.flatten(operations.map(operation => alertTypes.map((alertType) => {
            const operationAlert = operationAlerts.find(alert => (alert.operationName === operation && alert.type === alertType));
            const operationTrend = operationTrends.find(trend => (trend.operationName === operation));

            if (operationAlert) {
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

function getOperationAlertsStats(serviceName, granularity, from, until) {
    return Q
        .all([fetchOperations(serviceName), fetchOperationAlerts(serviceName), fetchOperationTrends(serviceName, granularity, from, until)])
        .then(stats => mergeOperationAlertsAndTrends({
                operations: stats[0],
                operationAlerts: stats[1],
                operationTrends: stats[2]
            })
        );
}

store.getServiceAlerts = (serviceName, query) => {
    const defered = Q.defer();

    defered.resolve(getOperationAlertsStats(serviceName, query.granularity, query.from, query.until),
        error => defered.reject(new Error(error)));

    return defered.promise;
};

function parseAlertDetailResponse(data) {
    if (!data || !data.length) {
        return [];
    }

    const parsedData = [];
    const sortedPoints = data[0].datapoints.sort((a, b) => a[1] - b[1]);
    let lastHealthyPoint = sortedPoints[0][1];

    sortedPoints.forEach((point, index) => {
        if (!point[0]) {
            if (index && sortedPoints[index - 1][0]) {
                parsedData.push({
                    startTimestamp: lastHealthyPoint * 1000 * 1000,
                    endTimestamp: sortedPoints[index - 1][1] * 1000 * 1000
                });
            }

            lastHealthyPoint = point[1];
        }
    });

    return parsedData;
}

function getSelectedOperationDetails(serviceName, operationName, alertType) {
    const deferred = Q.defer();

    const target = `alertType.${alertType}.operationName.${toMetricTankOperationName(operationName)}.serviceName.${serviceName}.anomaly`;

    axios
        .get(`${metricTankUrl}/render?target=${target}`)
        .then(response => deferred.resolve(parseAlertDetailResponse(response.data)), error => deferred.reject(new Error(error)))
        .catch(error => logger.log(errorConverter.fromAxiosError(error)));

    return deferred.promise;
}

store.getAlertDetails = (serviceName, operationName, alertType) => {
    const deferred = Q.defer();

    deferred.resolve(
        getSelectedOperationDetails(serviceName, operationName, alertType),
        error => deferred.reject(new Error(error)));

    return deferred.promise;
};

module.exports = store;

