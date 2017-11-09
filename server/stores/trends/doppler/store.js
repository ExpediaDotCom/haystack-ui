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
const _ = require('lodash');
const logger = require('../../../support/logger').withIdentifier('support:doppler');

const store = {};
const dtsUrl = config.stores.trends.dopplerUrl;
const queue = config.stores.trends.queue;
const countTemplateName = config.stores.trends.countTemplateName;
const durationTemplateName = config.stores.trends.durationTemplateName;
const successTemplateName = config.stores.trends.successTemplateName;

function IsJsonArray(str) {
    try {
        const obj = JSON.parse(str);
        return Array.isArray(obj);
    } catch (e) {
        return false;
    }
}

function parseDopplerResponse(data, trendType) {
    const parsedData = [];

    if (IsJsonArray(data)) {
        JSON.parse(data).forEach((op) => {
            const opKV = {
                operationName: op.keys.operationName,
                [trendType]: op.values.map(datapoints => ({value: datapoints[0], timestamp: datapoints[1]}))
            };
            parsedData.push(opKV);
        });
    } else {
        logger.info(data);
    }
    return parsedData;
}

function getTrendValues(fetchTrendRequestBody, trendType) {
    const deferred = Q.defer();
    const postConfig = {
        transformResponse: [data => parseDopplerResponse(data, trendType)]
    };

    axios
        .post(`${dtsUrl}/value/_search`, fetchTrendRequestBody, postConfig)
        .then(response => deferred.resolve(response.data, fetchTrendRequestBody),
            error => deferred.reject(new Error(error)));

    return deferred.promise;
}

function fetchOperationDataPoints(operationTrends, trendType) {
    const dataPoints = operationTrends.find(trend => trendType in trend);
    return (dataPoints ? dataPoints[trendType] : []);
}

function dataPointsSum(dataPoints) {
    return dataPoints.reduce(((accumulator, dataPoint) => (accumulator + dataPoint.value)), 0);
}

function groupByOperation({countValues, successValues, failureValues, tp99Values}) {
    const trendResults = [];
    const groupedByOperationName = _.groupBy(countValues.concat(successValues, failureValues, tp99Values), val => val.operationName);

    Object.keys(groupedByOperationName).forEach((operationName) => {
        const operationTrends = groupedByOperationName[operationName];
        const count = fetchOperationDataPoints(operationTrends, 'count');
        const successCount = fetchOperationDataPoints(operationTrends, 'success');
        const tp99Duration = fetchOperationDataPoints(operationTrends, 'tp99');

        const opKV = {
            operationName,
            count: dataPointsSum(count),
            successPercent: (dataPointsSum(successCount) / dataPointsSum(count)) * 100,
            tp99Duration
        };

        trendResults.push(opKV);
    });

    return trendResults;
}

function getDopplerServiceTrendResults(service, timeWindow, from, until) {
    const countTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: countTemplateName,
            serviceName: service,
            value_name: `${timeWindow}-count`
        },
        from,
        until
    };
    const successTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: successTemplateName,
            serviceName: service,
            value_name: `${timeWindow}-count`,
            success: 'true'
        },
        from,
        until
    };
    const failureTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: successTemplateName,
            serviceName: service,
            value_name: `${timeWindow}-count`,
            success: 'false'
        },
        from,
        until
    };
    const tp99TemplateKeys = {
        keys: {
            queue,
            metricField: 'duration',
            metricType: 'histogram',
            templateName: durationTemplateName,
            serviceName: service,
            value_name: `${timeWindow}-99percentile`
        },
        from,
        until
    };

    return Q.all([
        getTrendValues(countTemplateKeys, 'count'),
        getTrendValues(successTemplateKeys, 'success'),
        getTrendValues(failureTemplateKeys, 'failure'),
        getTrendValues(tp99TemplateKeys, 'tp99')
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
        case '60000': return '1min';
        case '300000': return '5min';
        case '900000': return '15min';
        case '3600000': return '1hour';
        default: return '1min';
    }
}

store.getTrendsForService = (serviceName, granularity, from, until) => {
    const deffered = Q.defer();
    deffered.resolve(getDopplerServiceTrendResults(serviceName, convertGranularityToTimeWindow(granularity), from, until),
        error => deffered.reject(new Error(error)));

    return deffered.promise;
};

// fetching trends for an individual operation
function fetchTrendValues(trendRequest) {
    const deferred = Q.defer();

    axios
        .post(`${dtsUrl}/value/_search`, trendRequest)
        .then(response => deferred.resolve(response.data[0]
            ? response.data[0].values.map(datapoints => ({value: datapoints[0], timestamp: datapoints[1]}))
            : []));

    return deferred.promise;
}

function getDopplerOperationTrendResults(serviceName, operationName, timeWindow, from, until) {
    const countTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: countTemplateName,
            serviceName,
            value_name: `${timeWindow}-count`,
            operationName
        },
        from,
        until
    };
    const durationTemplateKeys = {
        keys: {
            queue,
            metricField: 'duration',
            metricType: 'histogram',
            templateName: durationTemplateName,
            serviceName,
            value_name: `${timeWindow}-mean`,
            operationName
        },
        from,
        until
    };
    const successTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: successTemplateName,
            serviceName,
            value_name: `${timeWindow}-count`,
            success: 'true',
            operationName
        },
        from,
        until
    };
    const failureTemplateKeys = {
        keys: {
            queue,
            metricType: 'count',
            templateName: successTemplateName,
            serviceName,
            value_name: `${timeWindow}-count`,
            success: 'false',
            operationName
        },
        from,
        until
    };
    const tp95TemplateKeys = {
        keys: {
            queue,
            metricField: 'duration',
            metricType: 'histogram',
            templateName: durationTemplateName,
            serviceName,
            value_name: `${timeWindow}-95percentile`,
            operationName
        },
        from,
        until
    };
    const tp99TemplateKeys = {
        keys: {
            queue,
            metricField: 'duration',
            metricType: 'histogram',
            templateName: durationTemplateName,
            serviceName,
            value_name: `${timeWindow}-99percentile`,
            operationName
        },
        from,
        until
    };

    return Q.all([
        fetchTrendValues(countTemplateKeys),
        fetchTrendValues(successTemplateKeys),
        fetchTrendValues(failureTemplateKeys),
        fetchTrendValues(durationTemplateKeys),
        fetchTrendValues(tp95TemplateKeys),
        fetchTrendValues(tp99TemplateKeys)
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

store.getTrendsForOperation = (serviceName, operationName, granularity, from, until) => {
    const deffered = Q.defer();

    getDopplerOperationTrendResults(serviceName, operationName, convertGranularityToTimeWindow(granularity), from, until)
        .then(results => deffered.resolve(results));

    return deffered.promise;
};


module.exports = store;
