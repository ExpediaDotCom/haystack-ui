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
const _ = require('lodash');
const Q = require('q');
const config = require('../config/config');

const store = {};
const baseZipkinUrl = config.store.zipkin.url;

function getBinaryAnnotation(span, key) {
    return span.binaryAnnotations ? span.binaryAnnotations.find(annotation => annotation.key === key) : null;
}

function mapQueryParams(query) {
    return Object
        .keys(query)
        .filter(key => query[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
        .join('&');
}

function toHaystackTags(binaryAnnotations) {
    return binaryAnnotations.map(annotation => ({
        key: annotation.key,
        value: annotation.value
    }));
}

function toHaystackLogs(annotations) {
    return annotations.map(annotation => ({
        timestamp: annotation.timestamp / 1000,
        fields: [{
            key: 'event',
            value: annotation.value
        }]
    }));
}

function getServiceName(zipkinSpan) {
    const serverReceived = zipkinSpan.annotations.find(annotation => annotation.value === 'sr');
    const serverSend = zipkinSpan.annotations.find(annotation => annotation.value === 'ss');

    return (serverReceived && serverReceived.endpoint && serverReceived.endpoint.serviceName)
        || (serverSend && serverSend.endpoint && serverSend.endpoint.serviceName)
        || (zipkinSpan.binaryAnnotations
        && zipkinSpan.binaryAnnotations[0]
        && zipkinSpan.binaryAnnotations[0].endpoint
        && zipkinSpan.binaryAnnotations[0].endpoint.serviceName)
        || 'Not Found';
}

function toHaystackTrace(zipkinTrace) {
    return zipkinTrace.map(zipkinSpan => ({
        traceId: zipkinSpan.traceId,
        spanId: zipkinSpan.id,
        parentSpanId: zipkinSpan.parentId,
        serviceName: getServiceName(zipkinSpan),
        operationName: zipkinSpan.name,
        startTime: zipkinSpan.timestamp / 1000,
        duration: zipkinSpan.duration / 1000,
        tags: toHaystackTags(zipkinSpan.binaryAnnotations),
        logs: toHaystackLogs(zipkinSpan.annotations)
    }));
}

function calcEndToEndDuration(spans) {
    const startTime = spans
        .map(span => span.timestamp)
        .reduce((earliest, cur) => Math.min(earliest, cur));
    const endTime = spans
        .map(span => (span.timestamp + span.duration))
        .reduce((latest, cur) => Math.max(latest, cur));
    const difference = endTime - startTime;
    return difference || 1;
}

function getSuccess(span) {
    if (span) {
        const success = getBinaryAnnotation(span, 'success');
        if (success && success.key && success.value) {
            return success.value === 'true';
        }
    }
    return null;
}

function toHaystackSearchResult(zipkinTraces, query) {
    return zipkinTraces.filter(e => e.length).map((trace) => {
        const rootSpan = trace.find(span => !span.parentId);
        const services = _.countBy(trace,
            span => getServiceName(span));
        const mappedServices = _.keys(services).map((service) => {
            const spans = trace
                .filter(span => getServiceName(span) === service);
            return {
                name: service,
                spanCount: services[service],
                duration: calcEndToEndDuration(spans)
            };
        });

        const queriedSvcDur = mappedServices.find(s => s.name === (query.serviceName || rootSpan.serviceName)).duration || 0.001;
        const duration = calcEndToEndDuration(trace) || 0.001;
        const queriedSvcDurPerc = (queriedSvcDur / duration) * 100;
        const urlAnnotation = getBinaryAnnotation(rootSpan, 'url');
        const methodUriAnnotation = getBinaryAnnotation(rootSpan, 'methodUri');
        const rootSpanSuccess = getSuccess(rootSpan);
        const queriedOperationSuccess = (query.operationName !== 'all')
            ? getSuccess(trace.find(span => span.name === query.operationName))
            : null;
        const queriedServiceSuccess = !(trace.filter(span => getServiceName(span) === query.serviceName)).some(span => getSuccess(span) === false);
        return {
            traceId: trace[0].traceId,
            services: mappedServices,
            root: {
                url: (urlAnnotation && urlAnnotation.value) || (methodUriAnnotation && methodUriAnnotation.value) || '',
                serviceName: getServiceName(rootSpan),
                operationName: rootSpan.name
            },
            startTime: Math.floor(rootSpan.timestamp / 1000000),
            duration,
            queriedSvcDur,
            queriedSvcDurPerc,
            rootSpanSuccess,
            queriedOperationSuccess,
            queriedServiceSuccess
        };
    });
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
        .then(response => deferred.resolve(toHaystackTrace(response.data)));

    return deferred.promise;
};

store.findTraces = (query) => {
    const deferred = Q.defer();
    const queryUrl = mapQueryParams(query);

    if (query.traceId) {
        // if search is for a trace perform getTrace instead of search
        axios
            .get(`${baseZipkinUrl}/trace/${query.traceId}`)
            .then(response => deferred.resolve(toHaystackSearchResult([response.data], query)));
    } else {
        axios
            .get(`${baseZipkinUrl}/traces?limit=40&${queryUrl}`)
            .then(response => deferred.resolve(toHaystackSearchResult(response.data, query)));
    }

    return deferred.promise;
};


module.exports = store;
