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

function createOperationTarget(service, operationName, timeWindow, metricStats, metricNames) {
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

function toMilliseconds(micro) {
    return Math.ceil(micro / 1000);
}

function groupResponseByServiceOperation(data) {
    return data.map((op) => {
        const targetSplit = op.target.split('.');

        const serviceNameTagIndex = targetSplit.indexOf('serviceName');
        const operationNameTagIndex = targetSplit.indexOf('operationName');
        const serviceName = (serviceNameTagIndex !== -1) ? targetSplit[serviceNameTagIndex + 1] : null;
        const operationName = (operationNameTagIndex !== -1) ? fromMetricTankOperationName(targetSplit[operationNameTagIndex + 1]) : null;
        const trendStatTagIndex = targetSplit.indexOf('stat');
        const trendStat = `${targetSplit[trendStatTagIndex + 1]}.${targetSplit[trendStatTagIndex + 2]}`;

        return {
            serviceName,
            operationName,
            [trendStat]: op.datapoints.map(datapoint => ({value: datapoint[0], timestamp: convertEpochTimeInSecondsToMillis(datapoint[1])}))
        };
    });
}

function fetchTrendValues(target, from, until) {
    return trendsFetcher
        .fetch(`${metricTankUrl}/render?target=${target}&from=${from}&to=${until}`)
        .then(data => groupResponseByServiceOperation(data));
}

function extractTrendPointsForSingleServiceOperation(operationTrends, trendStat) {
    const dataPoints = operationTrends.find(trend => trendStat in trend);
    const trendStatDataPoints = dataPoints ? dataPoints[trendStat] : [];

    if (trendStatDataPoints.length && trendStatDataPoints[trendStatDataPoints.length - 1].value === null) {
        trendStatDataPoints.pop();
    }

    return trendStatDataPoints;
}

function dataPointsSum(dataPoints) {
    return dataPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
}

function toSuccessPercent(successPoints, failurePoints, ambiguousPoints) {
    const successCount = successPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
    const failureCount = failurePoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
    const ambiguousCount = ambiguousPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);

    return 100 - (((failureCount + ambiguousCount) / (successCount + failureCount + ambiguousCount)) * 100);
}

function toSuccessPercentPoints(successCount, failureCount, ambiguousCount) {
    const successTimestamps = successCount.map(point => point.timestamp);
    const failureTimestamps = failureCount.map(point => point.timestamp);
    const ambiguousTimestamps = ambiguousCount.map(point => point.timestamp);

    const timestamps = _.uniq([...successTimestamps, ...failureTimestamps, ...ambiguousTimestamps]);

    return _.compact(timestamps.map((timestamp) => {
        const successItem = _.find(successCount, x => (x.timestamp === timestamp));
        const successVal = (successItem && successItem.value) ? successItem.value : 0;

        const failureItem = _.find(failureCount, x => (x.timestamp === timestamp));
        const failureVal = (failureItem && failureItem.value) ? failureItem.value : 0;

        const ambiguousItem = _.find(ambiguousCount, x => (x.timestamp === timestamp));
        const ambiguousVal = (ambiguousItem && ambiguousItem.value) ? ambiguousItem.value : 0;

        if (successVal + failureVal + ambiguousVal) {
            return {
                value: (100 - (((failureVal + ambiguousVal) / (successVal + failureVal + ambiguousVal)) * 100)),
                timestamp
            };
        }
        return null;
    }));
}

function extractServicePerfStats({countValues, successValues, failureValues, ambiguousValues, tp99Values}) {
    const trendResults = [];

    const groupedByServiceName = _.groupBy(countValues.concat(successValues, failureValues, ambiguousValues, tp99Values), val => val.serviceName);
    Object.keys(groupedByServiceName).forEach((service) => {
        const serviceTrends = groupedByServiceName[service];
        const count = dataPointsSum(extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.received-span'));
        const successCount = dataPointsSum(extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.success-span'));
        const failureCount = dataPointsSum(extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.failure-span'));
        const ambiguousCount = dataPointsSum(extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.ambiguous-span'));
        const successPercent = ((successCount / (successCount + failureCount + ambiguousCount)) * 100);

        const opKV = {
            serviceName: service,
            successPercent,
            failureCount,
            successCount,
            ambiguousCount,
            totalCount: count
        };

        trendResults.push(opKV);
    });
    return trendResults;
}

function extractServiceSummary(serviceTrends) {
    const countPoints = extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.received-span');
    const successCount = extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.success-span');
    const failureCount = extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.failure-span');
    const ambiguousCount = extractTrendPointsForSingleServiceOperation(serviceTrends, 'count.ambiguous-span');
    const tp99DurationPoints = extractTrendPointsForSingleServiceOperation(serviceTrends, '*_99.duration');
    const latestTp99DurationDatapoint = _.findLast(tp99DurationPoints, point => point.value);

    return [{
        type: 'Incoming Requests',
        totalCount: dataPointsSum(countPoints),
        countPoints,
        avgSuccessPercent: toSuccessPercent(successCount, failureCount, ambiguousCount),
        successPercentPoints: toSuccessPercentPoints(successCount, failureCount, ambiguousCount),
        latestTp99Duration: latestTp99DurationDatapoint && latestTp99DurationDatapoint.value,
        tp99DurationPoints
    }];
}

function extractOperationSummary(values) {
    const groupedByOperationName = _.groupBy(values, val => val.operationName);

    return Object.keys(groupedByOperationName).map((operationName) => {
        const operationTrends = groupedByOperationName[operationName];

        const countPoints = extractTrendPointsForSingleServiceOperation(operationTrends, 'count.received-span');
        const ambiguousPoints = extractTrendPointsForSingleServiceOperation(operationTrends, 'count.ambiguous-span');
        const successPoints = extractTrendPointsForSingleServiceOperation(operationTrends, 'count.success-span');
        const failurePoints = extractTrendPointsForSingleServiceOperation(operationTrends, 'count.failure-span');
        const tp99DurationPoints = extractTrendPointsForSingleServiceOperation(operationTrends, '*_99.duration');
        const latestTp99DurationDatapoint = _.findLast(tp99DurationPoints, point => point.value);

        return {
            operationName,
            totalCount: dataPointsSum(countPoints),
            countPoints,
            avgSuccessPercent: toSuccessPercent(successPoints, failurePoints, ambiguousPoints),
            successPercentPoints: toSuccessPercentPoints(successPoints, failurePoints, ambiguousPoints),
            latestTp99Duration: latestTp99DurationDatapoint && latestTp99DurationDatapoint.value,
            tp99DurationPoints,
            failurePoints,
            ambiguousPoints
        };
    });
}

function getServicePerfStatsResults(timeWindow, from, until) {
    const CountTarget = getServiceTargetStat('*', timeWindow, 'count', 'received-span');
    const SuccessTarget = getServiceTargetStat('*', timeWindow, 'count', 'success-span');
    const FailureTarget = getServiceTargetStat('*', timeWindow, 'count', 'failure-span');
    const AmbiguousTarget = getServiceTargetStat('*', timeWindow, 'count', 'ambiguous-span');
    const tp99Target = getServiceTargetStat('*', timeWindow, '*_99', 'duration');


    return Q.all([
        fetchTrendValues(CountTarget, from, until),
        fetchTrendValues(SuccessTarget, from, until),
        fetchTrendValues(FailureTarget, from, until),
        fetchTrendValues(AmbiguousTarget, from, until),
        fetchTrendValues(tp99Target, from, until)
    ])
        .then(values => extractServicePerfStats({
                countValues: values[0],
                successValues: values[1],
                failureValues: values[2],
            ambiguousValues: values[3],
            tp99Values: values[4]
            })
        );
}

function getServiceSummaryResults(serviceName, timeWindow, from, until) {
    const target = getServiceTargetStat(serviceName, timeWindow, 'count,*_99', 'received-span,ambiguous-span,success-span,failure-span,duration');

    return fetchTrendValues(target, from, until)
        .then(values => extractServiceSummary(values));
}

function getServiceTrendResults(serviceName, timeWindow, from, until) {
    const target = getServiceTargetStat(serviceName, timeWindow, 'count,mean,*_95,*_99', 'received-span,ambiguous-span,success-span,failure-span,duration');

    return fetchTrendValues(target, from, until)
        .then(trends => ({
            count: extractTrendPointsForSingleServiceOperation(trends, 'count.received-span'),
            ambiguousCount: extractTrendPointsForSingleServiceOperation(trends, 'count.ambiguous-span'),
            successCount: extractTrendPointsForSingleServiceOperation(trends, 'count.success-span'),
            failureCount: extractTrendPointsForSingleServiceOperation(trends, 'count.failure-span'),
            meanDuration: extractTrendPointsForSingleServiceOperation(trends, 'mean.duration'),
            tp95Duration: extractTrendPointsForSingleServiceOperation(trends, '*_95.duration'),
            tp99Duration: extractTrendPointsForSingleServiceOperation(trends, '*_99.duration')
        }));
}

function getOperationSummaryResults(service, timeWindow, from, until) {
    const target = createOperationTarget(service, '*', timeWindow, 'count,*_99', 'received-span,ambiguous-span,success-span,failure-span,duration');

    return fetchTrendValues(target, from, until)
        .then(values => extractOperationSummary(values));
}

function getOperationTrendResults(serviceName, operationName, timeWindow, from, until) {
    const target = createOperationTarget(serviceName, operationName, timeWindow, 'count,mean,*_95,*_99', 'received-span,ambiguous-span,success-span,failure-span,duration');

    return fetchTrendValues(target, from, until)
        .then(trends => ({
            count: extractTrendPointsForSingleServiceOperation(trends, 'count.received-span'),
            ambiguousCount: extractTrendPointsForSingleServiceOperation(trends, 'count.ambiguous-span'),
            successCount: extractTrendPointsForSingleServiceOperation(trends, 'count.success-span'),
            failureCount: extractTrendPointsForSingleServiceOperation(trends, 'count.failure-span'),
            meanDuration: extractTrendPointsForSingleServiceOperation(trends, 'mean.duration'),
            tp95Duration: extractTrendPointsForSingleServiceOperation(trends, '*_95.duration'),
            tp99Duration: extractTrendPointsForSingleServiceOperation(trends, '*_99.duration')
        }));
}

// api
connector.getServicePerfStats = (granularity, from, until) =>
    getServicePerfStatsResults(convertGranularityToTimeWindow(granularity), toMilliseconds(from), toMilliseconds(until));

connector.getServiceStats = (serviceName, granularity, from, until) =>
    getServiceSummaryResults(serviceName, convertGranularityToTimeWindow(granularity), toMilliseconds(from), toMilliseconds(until));

connector.getServiceTrends = (serviceName, granularity, from, until) =>
    getServiceTrendResults(serviceName, convertGranularityToTimeWindow(granularity), toMilliseconds(from), toMilliseconds(until));

connector.getOperationStats = (serviceName, granularity, from, until) =>
    getOperationSummaryResults(serviceName, convertGranularityToTimeWindow(granularity), toMilliseconds(from), toMilliseconds(until));

connector.getOperationTrends = (serviceName, operationName, granularity, from, until) =>
    getOperationTrendResults(serviceName, toMetricTankOperationName(operationName), convertGranularityToTimeWindow(granularity), toMilliseconds(from), toMilliseconds(until));

module.exports = connector;
