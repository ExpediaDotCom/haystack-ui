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
const config = require('../../../config/config');
const cache = require('../../../routes/utils/cache');

const traceStore = require(`../../traces/${config.stores.traces.storeName}/store`); // eslint-disable-line import/no-dynamic-require
const trendStore = require(`../../trends/${config.stores.trends.storeName}/store`); // eslint-disable-line import/no-dynamic-require

const errorConverter = require('../../utils/errorConverter');
// const _ = require('lodash');
const logger = require('../../../support/logger').withIdentifier('support:haystack_trends');

const store = {};
const metricTankUrl = config.stores.alerts.metricTankUrl;

function getAllOperations(serviceName) {
    const deffered = Q.defer();

    const cachedOps = cache.get(`/api/operations?serviceName=${serviceName}`);

    if (cachedOps) {
        deffered.resolve(cachedOps);
    } else {
        deffered.resolve(traceStore.getOperations(serviceName));
    }

    return deffered.promise;
}

function getAllOperationsTrendStats(serviceName, granularity, from, until) {
    const deffered = Q.defer();

    deffered.resolve(trendStore.getOperationStats(serviceName, granularity, from, until));

    return deffered.promise;
}

function fromMetricTankOperationName(operationName) {
    return operationName.replace(/___/gi, '.');
}

function parseAvailableAlertsResponse(data) {
    const parsedData = [];

    data.forEach((op) => {
        const targetSplit = op.target.split('.');

        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const alertTypeIndex = targetSplit.indexOf('alertType');
        const operationName = (operationNameTagIndex !== -1) ? fromMetricTankOperationName(targetSplit[operationNameTagIndex + 1]) : null;
        const type = (alertTypeIndex !== -1) ? fromMetricTankOperationName(targetSplit[alertTypeIndex + 1]) : null;
        const datapoints = op.datapoints.slice(0, 200).sort((a, b) => b[1] - a[1]);
        const latestDatapoint = datapoints[0];
        const isUnhealthy = latestDatapoint[0] === 1;
        const timestamp = latestDatapoint[1] * 1000 * 1000;

        const opKV = {
            operationName,
            type,
            isUnhealthy,
            timestamp
        };
        parsedData.push(opKV);
    });

    return parsedData;
}

function getAvailableAlertStats(serviceName) {
    const deferred = Q.defer();

    const target = `alertType.*.operationName.*.serviceName.${serviceName}.anomaly`;

    const postConfig = {
        transformResponse: [data => parseAvailableAlertsResponse(data)]
    };

    axios
        .get(`${metricTankUrl}/render?target=${target}&maxDataPoints=100`, postConfig)
        .then(response => deferred.resolve(response.data),
            error => deferred.reject(new Error(error)))
        .catch((error) => {
            logger.log(errorConverter.fromAxiosError(error));
        });

    return deferred.promise;
}

function addAvailableAlertTrends(availableAlertStats, allOperationsTrendStats) {
    const availableAlertsWithTrends = [];
    availableAlertStats.forEach((alertStat) => {
        const operationAlertStat = alertStat;
        const operationTrend = allOperationsTrendStats.find(operationTrendStats => operationTrendStats.operationName === alertStat.operationName);

        if (operationAlertStat.type === 'count') {
            operationAlertStat.trend = operationTrend.countPoints;
        } else if (operationAlertStat.type === 'durationTp99') {
            operationAlertStat.trend = operationTrend.tp99DurationPoints;
        } else if (operationAlertStat.type === 'failureCount') {
            operationAlertStat.trend = operationTrend.failurePoints;
        }
        availableAlertsWithTrends.push(operationAlertStat);
    });
    return availableAlertsWithTrends;
}

function mergeAllOperationAlerts({availableAlertStats, operations, allOperationsTrendStats}) {
    const allOperationsAlertStats = [];

    operations.forEach((operation) => {
        if (availableAlertStats.find(alertStats => (alertStats.operationName === operation)) === undefined) {
            const operationTrendStats = allOperationsTrendStats.find(operationStats => operationStats.operationName === operation);
            allOperationsAlertStats.push(
                {
                    operationName: operation,
                    type: 'count',
                    isUnhealthy: false,
                    timestamp: null,
                    trend: operationTrendStats && operationTrendStats.countPoints
                },
                {
                    operationName: operation,
                    type: 'durationTp99',
                    isUnhealthy: false,
                    timestamp: null,
                    trend: operationTrendStats && operationTrendStats.tp99DurationPoints
                },
                {
                    operationName: operation,
                    type: 'failureCount',
                    isUnhealthy: false,
                    timestamp: null,
                    trend: operationTrendStats && operationTrendStats.failurePoints
                }
            );
        }
    });

    return allOperationsAlertStats.concat(addAvailableAlertTrends(availableAlertStats, allOperationsTrendStats));
}

function getAllOperationsAlertStats(serviceName, granularity, from, until) {
    return Q.all([getAvailableAlertStats(serviceName, from, until), getAllOperations(serviceName), getAllOperationsTrendStats(serviceName, granularity, from, until)])
        .then(stats => mergeAllOperationAlerts({
                availableAlertStats: stats[0],
                operations: stats[1],
                allOperationsTrendStats: stats[2]
            })
        );
}

store.getServiceAlerts = (serviceName, query) => {
    const deffered = Q.defer();

    deffered.resolve(getAllOperationsAlertStats(serviceName, query.granularity, query.from, query.until),
        error => deffered.reject(new Error(error)));

    return deffered.promise;
};


function parseAlertDetailResponse(data) {
    const parsedData = [];

    const sortedDatapoints = data[0].datapoints.sort((a, b) => b[1] - a[1]);

    sortedDatapoints.forEach((datapoint, index) => {
        const endTimeStampDP = (sortedDatapoints.slice(index, sortedDatapoints.length - 1).find(dp => dp[0] !== datapoint[0]));

        const opKV = {
            startTimestamp: datapoint[1],
            endTimestamp: endTimeStampDP && endTimeStampDP[1]
        };

        parsedData.push(opKV);
    });

    return parsedData;
}

function getSelectedOperationDetails(serviceName, operationName, alertType) {
    const deferred = Q.defer();

    const target = `alertType.${alertType}.operationName.${operationName}.serviceName.${serviceName}.anomaly`;

    const postConfig = {
        transformResponse: [data => parseAlertDetailResponse(data)]
    };

    axios
        .get(`${metricTankUrl}/render?target=${target}&maxDataPoints=100`, postConfig)
        .then(response => deferred.resolve(response.data),
            error => deferred.reject(new Error(error)))
        .catch((error) => {
            logger.log(errorConverter.fromAxiosError(error));
        });

    return deferred.promise;
}


store.getAlertDetails = (serviceName, operationName, alertType) => {
    const deffered = Q.defer();

    deffered.resolve(getSelectedOperationDetails(serviceName, operationName, alertType),
        error => deffered.reject(new Error(error)));

    return deffered.promise;
};

module.exports = store;
