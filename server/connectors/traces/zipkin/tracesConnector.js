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

const config = require('../../../config/config');
const converter = require('./converter');
const objectUtils = require('../../utils/objectUtils');
const fetcher = require('../../operations/restFetcher');

const connector = {};
const baseZipkinUrl = config.connectors.traces.zipkinUrl;

const servicesFetcher = fetcher('getServices');
const operationsFetcher = fetcher('getOperations');
const traceFetcher = fetcher('getTrace');
const searchTracesFetcher = fetcher('searchTraces');
const rawTraceFetcher = fetcher('getRawTrace');
const rawSpanFetcher = fetcher('getRawSpan');

const reservedField = ['serviceName', 'operationName', 'startTime', 'endTime', 'limit'];
const DEFAULT_RESULTS_LIMIT = 40;

function toAnnotationQuery(query) {
  return Object
    .keys(query)
    .filter(key => query[key] && !reservedField.includes(key))
    .map(key => `${encodeURIComponent(key).toLowerCase()}=${encodeURIComponent(query[key])}`)
    .join(' ');
}

function mapQueryParams(query) {
    const mappedQuery = {
        serviceName: query.serviceName,
        spanName: query.operationName ? query.operationName : 'all',
        annotationQuery: toAnnotationQuery(query),
        endTs: (parseInt(query.endTime, 10) - (30 * 1000 * 1000)) / 1000,
        lookback: (parseInt(query.endTime, 10) - parseInt(query.startTime, 10)) / 1000,
        limit: parseInt(query.limit, 10) || DEFAULT_RESULTS_LIMIT
    };

    return Object
        .keys(mappedQuery)
        .filter(key => mappedQuery[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(mappedQuery[key])}`)
        .join('&');
}

connector.getServices = () =>
    servicesFetcher
    .fetch(`${baseZipkinUrl}/services`);

connector.getOperations = serviceName =>
    operationsFetcher
    .fetch(`${baseZipkinUrl}/spans?serviceName=${serviceName}`);

connector.getTrace = traceId =>
    traceFetcher
    .fetch(`${baseZipkinUrl}/trace/${traceId}`)
    .then(result => converter.toHaystackTrace(result));

connector.findTraces = (query) => {
    const traceId = objectUtils.getPropIgnoringCase(query, 'traceId');

    if (traceId) {
        // if search is for a trace perform getTrace instead of search
        return traceFetcher
        .fetch(`${baseZipkinUrl}/trace/${traceId}`)
        .then(result => converter.toHaystackSearchResult([result], query));
    }

    const queryUrl = mapQueryParams(query);

    return searchTracesFetcher
    .fetch(`${baseZipkinUrl}/traces?${queryUrl}`)
    .then(result => converter.toHaystackSearchResult(result, query));
};

connector.getRawTrace = traceId =>
    rawTraceFetcher
    .fetch(`${baseZipkinUrl}/trace/raw/${traceId}`);

connector.getRawSpan = (traceId, spanId) =>
    rawSpanFetcher
    .fetch(`${baseZipkinUrl}/trace/raw/${traceId}/${spanId}`);

module.exports = connector;
