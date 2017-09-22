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
const config = require('../../config/config');
const converter = require('./converter');

const store = {};
const baseZipkinUrl = config.store.zipkin.url;

const reservedField = ['serviceName', 'operationName', 'timePreset', 'startTime', 'endTime'];

function rangeToDuration(preset) {
    if (preset) {
        const count = preset.substr(0, preset.length - 1);
        const unit = preset[preset.length - 1];
        let multiplier;

        switch (unit) {
          case 's':
            multiplier = 60;
            break;
          case 'h':
            multiplier = 60 * 60;
            break;
          case 'd':
            multiplier = 60 * 60 * 24;
            break;
          default:
            multiplier = 60;
        }

        return parseInt(count, 10) * multiplier * 1000;
    }

  return null;
}

function toAnnotationQuery(query) {
  return Object
    .keys(query)
    .filter(key => query[key] && !reservedField.includes(key))
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join(' ');
}

function mapQueryParams(query) {
    const mappedQuery = {
        serviceName: query.serviceName,
        spanName: query.operationName,
        annotationQuery: toAnnotationQuery(query),
        endTs: query.endTime || Date().now * 1000,
        lookback: rangeToDuration(query.timePreset) || (query.endTime - query.startTime),
        limit: 40
    };

    return Object
        .keys(mappedQuery)
        .filter(key => mappedQuery[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(mappedQuery[key])}`)
        .join('&');
}

store.getServices = () => {
    const deferred = Q.defer();
    axios
        .get(`${baseZipkinUrl}/services`)
        .then((response) => {
                deferred.resolve(response.data);
            }
        );

    return deferred.promise;
};

store.getOperations = (serviceName) => {
    const deferred = Q.defer();

    axios
        .get(`${baseZipkinUrl}/spans?serviceName=${serviceName}`)
        .then(response => deferred.resolve(response.data));

    return deferred.promise;
};

store.getTrace = (traceId) => {
    const deferred = Q.defer();

    axios
        .get(`${baseZipkinUrl}/trace/${traceId}`)
        .then(response => deferred.resolve(converter.toHaystackTrace(response.data)));

    return deferred.promise;
};

store.findTraces = (query) => {
    const deferred = Q.defer();
    const queryUrl = mapQueryParams(query);

    if (query.traceId) {
        // if search is for a trace perform getTrace instead of search
        axios
            .get(`${baseZipkinUrl}/trace/${query.traceId}`)
            .then(response => deferred.resolve(converter.toHaystackSearchResult([response.data], query)));
    } else {
        axios
            .get(`${baseZipkinUrl}/traces?${queryUrl}`)
            .then(response => deferred.resolve(converter.toHaystackSearchResult(response.data, query)));
    }

    return deferred.promise;
};


module.exports = store;
