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
const config = require('../../../config/config');
const _ = require('lodash');
const fetcher = require('../../fetchers/restFetcher');

const trendsFetcher = fetcher('trends');

const connector = {};
const metricTankUrl = config.connectors.trends.metricTankUrl;

function getOperationTargetStat(service, operationName, timeWindow, metricStats, metricNames) {
    return `haystack.serviceName.${service}.operationName.${operationName}.interval.${timeWindow}.stat.{${metricStats}}.{${metricNames}}`;
}
function getServiceTargetStat(service, timeWindow, metricStats, metricNames) {
    return `haystack.serviceName.${service}.interval.${timeWindow}.stat.{${metricStats}}.{${metricNames}}`;
}

function convertGranularityToTimeWindow(timespan) {
    switch (timespan) {
        case '60000':
            return 'OneMinute';
        case '300000':
            return 'FiveMinute';
        case '900000':
            return 'FifteenMinute';
        case '3600000':
            return 'OneHour';
        default:
            return 'OneMinute';
    }
}

function convertEpochTimeInSecondsToMillis(timestamp) {
    return timestamp * 1000;
}
function toMetricTankOperationName(operationName) {
    return operationName.replace(/\./gi, '___');
}

function fromMetricTankOperationName(operationName) {
    return operationName.replace(/___/gi, '.');
}

function parseServiceResponse(data) {
    const parsedData = [];
    data.forEach((op) => {
        const targetSplit = op.target.split('.');

        const serviceNameTagIndex = targetSplit.indexOf('serviceName');
        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const serviceName = (serviceNameTagIndex !== -1) ? targetSplit[serviceNameTagIndex + 1] : null;
        const operationName = (operationNameTagIndex !== -1) ? fromMetricTankOperationName(targetSplit[operationNameTagIndex + 1]) : null;
        const trendStatTagIndex = targetSplit.indexOf('stat');
        const trendStat = `${targetSplit[trendStatTagIndex + 1]}.${targetSplit[trendStatTagIndex + 2]}`;
        const opKV = {
            serviceName,
            operationName,
            [trendStat]: op.datapoints.map(datapoint => ({value: datapoint[0], timestamp: convertEpochTimeInSecondsToMillis(datapoint[1])
            }))
        };
        parsedData.push(opKV);
    });
    return parsedData;
}

function getTrendValues(target, from, until) {
    return trendsFetcher
        .fetch(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`)
        .then(data => parseServiceResponse(data, target));
}

function fetchDatapoints(operationTrends, trendStat) {
    const dataPoints = operationTrends.find(trend => trendStat in trend);
    const trendStatDataPoints = dataPoints ? dataPoints[trendStat] : [];
    if (trendStatDataPoints.length !== 0 && trendStatDataPoints[trendStatDataPoints.length - 1].value === null) {
        trendStatDataPoints.pop();
    }
    return trendStatDataPoints;
}

function dataPointsSum(dataPoints) {
    return dataPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
}

function toSuccessPercent(successPoints, failurePoints) {
    const successCount = successPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
    const failureCount = failurePoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);

    return 100 - ((failureCount / (successCount + failureCount)) * 100);
}

function toSuccessPercentPoints(successCount, failureCount) {
    const successTimestamps = successCount.map(point => point.timestamp);
    const failureTimestamps = failureCount.map(point => point.timestamp);
    const timestamps = _.uniq([...successTimestamps, ...failureTimestamps]);

    return _.compact(timestamps.map((timestamp) => {
        const successItem = _.find(successCount, x => (x.timestamp === timestamp));
        const successVal = (successItem && successItem.value) ? successItem.value : 0;

        const failureItem = _.find(failureCount, x => (x.timestamp === timestamp));
        const failureVal = (failureItem && failureItem.value) ? failureItem.value : 0;

        if (successVal + failureVal) {
            return {
                value: (100 - ((failureVal / (successVal + failureVal)) * 100)),
                timestamp
            };
        }
        return null;
    }));
}

function fetchServicePerfStats({countValues, successValues, failureValues, tp99Values}) {
    const trendResults = [];

    const groupedByServiceName = _.groupBy(countValues.concat(successValues, failureValues, tp99Values), val => val.serviceName);
    Object.keys(groupedByServiceName).forEach((service) => {
        const serviceTrends = groupedByServiceName[service];
        const count = dataPointsSum(fetchDatapoints(serviceTrends, 'count.received-span'));
        const successCount = dataPointsSum(fetchDatapoints(serviceTrends, 'count.success-span'));
        const failureCount = dataPointsSum(fetchDatapoints(serviceTrends, 'count.failure-span'));
        const successPercent = ((successCount / (successCount + failureCount)) * 100);

        const opKV = {
            serviceName: service,
            successPercent,
            failureCount,
            successCount,
            totalCount: count
        };

        trendResults.push(opKV);
    });
    return trendResults;
}

function fetchServiceStats(serviceTrends) {
    const serviceStats = [];
    const countPoints = fetchDatapoints(serviceTrends, 'count.received-span');
    const successCount = fetchDatapoints(serviceTrends, 'count.success-span');
    const failureCount = fetchDatapoints(serviceTrends, 'count.failure-span');
    const tp99DurationPoints = fetchDatapoints(serviceTrends, '*_99.duration');
    const latestTp99DurationDatapoint = _.findLast(tp99DurationPoints, point => point.value);
    const serviceStat = {
        type: 'Incoming Requests',
        totalCount: dataPointsSum(countPoints),
        countPoints,
        avgSuccessPercent: toSuccessPercent(successCount, failureCount),
        successPercentPoints: toSuccessPercentPoints(successCount, failureCount),
        latestTp99Duration: latestTp99DurationDatapoint && latestTp99DurationDatapoint.value,
        tp99DurationPoints
    };
    serviceStats.push(serviceStat);
    return serviceStats;
}

function fetchOperationStats(values) {
    const trendResults = [];
    const groupedByOperationName = _.groupBy(values, val => val.operationName);
    Object.keys(groupedByOperationName).forEach((operationName) => {
        const operationTrends = groupedByOperationName[operationName];
        const countPoints = fetchDatapoints(operationTrends, 'count.received-span');
        const successCount = fetchDatapoints(operationTrends, 'count.success-span');
        const failureCount = fetchDatapoints(operationTrends, 'count.failure-span');
        const tp99DurationPoints = fetchDatapoints(operationTrends, '*_99.duration');
        const latestTp99DurationDatapoint = _.findLast(tp99DurationPoints, point => point.value);
        const opKV = {
            operationName,
            totalCount: dataPointsSum(countPoints),
            countPoints,
            avgSuccessPercent: toSuccessPercent(successCount, failureCount),
            successPercentPoints: toSuccessPercentPoints(successCount, failureCount),
            latestTp99Duration: latestTp99DurationDatapoint && latestTp99DurationDatapoint.value,
            tp99DurationPoints
        };

        trendResults.push(opKV);
    });

    return trendResults;
}

function getServicePerfStatsResults(timeWindow, from, until) {
    const CountTarget = getServiceTargetStat('*', timeWindow, 'count.received-span');
    const SuccessTarget = getServiceTargetStat('*', timeWindow, 'count.success-span');
    const FailureTarget = getServiceTargetStat('*', timeWindow, 'count.failure-span');
    const tp99Target = getServiceTargetStat('*', timeWindow, '*_99.duration');


    return Q.all([
        getTrendValues(CountTarget, from, until),
        getTrendValues(SuccessTarget, from, until),
        getTrendValues(FailureTarget, from, until),
        getTrendValues(tp99Target, from, until)
    ])
        .then(values => fetchServicePerfStats({
                countValues: values[0],
                successValues: values[1],
                failureValues: values[2],
                tp99Values: values[3]
            })
        );
}

function getServiceStatsResults(serviceName, timeWindow, from, until) {
    const target = getServiceTargetStat(serviceName, timeWindow, 'count,*_99', 'received-span,success-span,failure-span,duration');

    return Q.all([
        getTrendValues(target, from, until)
    ])
        .then(values => fetchServiceStats(values[0]));
}

function getServiceTrendResults(serviceName, timeWindow, from, until) {
    const target = getServiceTargetStat(serviceName, timeWindow, 'count,mean,*_95,*_99', 'received-span,success-span,failure-span,duration');

    return Q.all([
        getTrendValues(target, from, until)
    ])
        .then(trends => (
            {
                count: fetchDatapoints(trends[0], 'count.received-span'),
                successCount: fetchDatapoints(trends[0], 'count.success-span'),
                failureCount: fetchDatapoints(trends[0], 'count.failure-span'),
                meanDuration: fetchDatapoints(trends[0], 'mean.duration'),
                tp95Duration: fetchDatapoints(trends[0], '*_95.duration'),
                tp99Duration: fetchDatapoints(trends[0], '*_99.duration')
            })
        );
}

function getOperationStatsResults(service, timeWindow, from, until) {
    const target = getOperationTargetStat(service, '*', timeWindow, 'count,*_99', 'received-span,success-span,failure-span,duration');

    return Q.all([
        getTrendValues(target, from, until)
    ])
        .then(values => fetchOperationStats(values[0]));
}

function getOperationTrendResults(serviceName, operationName, timeWindow, from, until) {
    const target = getOperationTargetStat(serviceName, operationName, timeWindow, 'count,mean,*_95,*_99', 'received-span,success-span,failure-span,duration');

    return Q.all([
        getTrendValues(target, from, until)
    ])
        .then(trends => (
            {
                count: fetchDatapoints(trends[0], 'count.received-span'),
                successCount: fetchDatapoints(trends[0], 'count.success-span'),
                failureCount: fetchDatapoints(trends[0], 'count.failure-span'),
                meanDuration: fetchDatapoints(trends[0], 'mean.duration'),
                tp95Duration: fetchDatapoints(trends[0], '*_95.duration'),
                tp99Duration: fetchDatapoints(trends[0], '*_99.duration')
            })
        );
}


// api
connector.getServicePerfStats = (granularity, from, until) => {
    const deferred = Q.defer();
    getServicePerfStatsResults(convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deferred.resolve(results));

    return deferred.promise;
};

connector.getServiceStats = (serviceName, granularity, from, until) => {
    const deferred = Q.defer();
    getServiceStatsResults(serviceName, convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deferred.resolve(results));
    return deferred.promise;
};

connector.getServiceTrends = (serviceName, granularity, from, until) => {
    const deferred = Q.defer();
    getServiceTrendResults(serviceName, convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deferred.resolve(results));

    return deferred.promise;
};

connector.getOperationStats = (serviceName, granularity, from, until) => {
    const deferred = Q.defer();
    getOperationStatsResults(serviceName, convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deferred.resolve(results));
    return deferred.promise;
};

connector.getOperationTrends = (serviceName, operationName, granularity, from, until) => {
    const deferred = Q.defer();

    getOperationTrendResults(serviceName, toMetricTankOperationName(operationName), convertGranularityToTimeWindow(granularity), parseInt(from / 1000, 10), parseInt(until / 1000, 10))
        .then(results => deferred.resolve(results));

    return deferred.promise;
};


module.exports = connector;
