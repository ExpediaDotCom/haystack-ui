/*
 * Copyright 2017 Expedia, Inc.
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
const errorConverter = require('../../utils/errorConverter');
const _ = require('lodash');
const logger = require('../../../support/logger').withIdentifier('support:haystack_trends');


const store = {};
const metricTankUrl = config.stores.trends.metricTankUrl;

function getServiceTargetStat(service, timeWindow, metricStat) {
    return `serviceName.${service}.operationName.*.interval.${timeWindow}.stat.${metricStat}`;
}

function getOperationTargetStat(service, operationName, timeWindow, metricStat) {
    return `serviceName.${service}.operationName.${operationName}.interval.${timeWindow}.stat.${metricStat}`;
}

function toMetricTankOperationName(operationName) {
    return operationName.replace(/\./gi, '___');
}

function fromMetricTankOperationName(operationName) {
    return operationName.replace(/___/gi, '.');
}

function parseServiceResponse(data) {
    const parsedData = [];
    JSON.parse(data).forEach((op) => {
        const targetSplit = op.target.split('.');
        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const operationName = fromMetricTankOperationName(targetSplit[operationNameTagIndex + 1]);
        const trendStatTagIndex = targetSplit.indexOf('stat');
        const trendStat = `${targetSplit[trendStatTagIndex + 1]}.${targetSplit[trendStatTagIndex + 2]}`;
        const opKV = {
            operationName,
            [trendStat]: op.datapoints.map(datapoint => ({value: datapoint[0], timestamp: datapoint[1]}))
        };
        parsedData.push(opKV);
    });
    return parsedData;
}

function getTrendValues(target, from, until) {
    const deferred = Q.defer();
    const requestConfig = {
        transformResponse: [data => parseServiceResponse(data, target)]
    };

    axios
        .get(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`, requestConfig)
        .then(response => deferred.resolve(response.data),
            error => deferred.reject(new Error(error)))
        .catch((error) => {
            logger.log(errorConverter.fromAxiosError(error));
        });

    return deferred.promise;
}

function fetchOperationDataPoints(operationTrends, trendStat) {
    const dataPoints = operationTrends.find(trend => trendStat in trend);
    return (dataPoints ? dataPoints[trendStat] : []);
}

function dataPointsSum(dataPoints) {
    return dataPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
}

function toSuccessPercent(successPoints, failurePoints) {
    const successCount = successPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
    const failureCount = failurePoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);

    return 100 - ((failureCount / (successCount + failureCount)) * 100);
}

function groupByOperation({countValues, successValues, failureValues, tp99Values}) {
    const trendResults = [];
    const groupedByOperationName = _.groupBy(countValues.concat(successValues, failureValues, tp99Values), val => val.operationName);
    Object.keys(groupedByOperationName).forEach((operationName) => {
        const operationTrends = groupedByOperationName[operationName];
        const count = fetchOperationDataPoints(operationTrends, 'count.received-span');
        const successCount = fetchOperationDataPoints(operationTrends, 'count.success-span');
        const failureCount = fetchOperationDataPoints(operationTrends, 'count.failure-span');
        const tp99Duration = fetchOperationDataPoints(operationTrends, '*_99.duration');

        const opKV = {
            operationName,
            count: dataPointsSum(count),
            successPercent: toSuccessPercent(successCount, failureCount),
            tp99Duration
        };

        trendResults.push(opKV);
    });
    return trendResults;
}

function getServiceTrendResults(service, timeWindow, from, until) {
    const CountTarget = getServiceTargetStat(service, timeWindow, 'count.received-span');
    const SuccessTarget = getServiceTargetStat(service, timeWindow, 'count.success-span');
    const FailureTarget = getServiceTargetStat(service, timeWindow, 'count.failure-span');
    const tp99Target = getServiceTargetStat(service, timeWindow, '*_99.duration');

    return Q.all([
        getTrendValues(CountTarget, from, until),
        getTrendValues(SuccessTarget, from, until),
        getTrendValues(FailureTarget, from, until),
        getTrendValues(tp99Target, from, until)
    ])
        .then(values => groupByOperation({
                countValues: values[0],
                successValues: values[1],
                failureValues: values[2],
                tp99Values: values[3]
            })
        );
}

function convertGranularityToTimeWindow(timespan) {
    switch (timespan) {
        case '60000': return 'OneMinute';
        case '300000': return 'FiveMinute';
        case '900000': return 'FifteenMinute';
        case '3600000': return 'OneHour';
        default: return 'OneMinute';
    }
}

store.getOperationStats = (serviceName, granularity, from, until) => {
    const deffered = Q.defer();
    deffered.resolve(getServiceTrendResults(serviceName, convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10)),
        error => deffered.reject(new Error(error)));
    return deffered.promise;
};

function convertEpochTimeInSecondsToMillis(timestamp) {
    return timestamp * 1000;
}

function fetchOperationTrendValues(target, from, until) {
    const deferred = Q.defer();

    axios
        .get(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`)
        .then(response => deferred.resolve(response.data[0]
            ? response.data[0].datapoints.map(datapoint => ({value: datapoint[0], timestamp: convertEpochTimeInSecondsToMillis(datapoint[1])}))
            : []),
            error => deferred.reject(new Error(error)))
        .catch((error) => {
            logger.log(errorConverter.fromAxiosError(error));
        });

    return deferred.promise;
}

function getOperationTrendResults(serviceName, operationName, timeWindow, from, until) {
    const CountTarget = getOperationTargetStat(serviceName, operationName, timeWindow, 'count.received-span');
    const SuccessTarget = getOperationTargetStat(serviceName, operationName, timeWindow, 'count.success-span');
    const FailureTarget = getOperationTargetStat(serviceName, operationName, timeWindow, 'count.failure-span');
    const meanTarget = getOperationTargetStat(serviceName, operationName, timeWindow, 'mean.duration');
    const tp95Target = getOperationTargetStat(serviceName, operationName, timeWindow, '*_95.duration');
    const tp99Target = getOperationTargetStat(serviceName, operationName, timeWindow, '*_99.duration');


    return Q.all([
        fetchOperationTrendValues(CountTarget, from, until),
        fetchOperationTrendValues(SuccessTarget, from, until),
        fetchOperationTrendValues(FailureTarget, from, until),
        fetchOperationTrendValues(meanTarget, from, until),
        fetchOperationTrendValues(tp95Target, from, until),
        fetchOperationTrendValues(tp99Target, from, until)
    ])
        .then(results => ({
                count: results[0],
                successCount: results[1],
                failureCount: results[2],
                meanDuration: results[3],
                tp95Duration: results[4],
                tp99Duration: results[5]
            })
        );
}

store.getOperationTrends = (serviceName, operationName, granularity, from, until) => {
    const deffered = Q.defer();

    getOperationTrendResults(serviceName, toMetricTankOperationName(operationName), convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deffered.resolve(results));

    return deffered.promise;
};

module.exports = store;
