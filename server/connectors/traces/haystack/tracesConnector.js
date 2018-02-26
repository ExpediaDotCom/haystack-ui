/*

 *  Copyright 2018 Expedia, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *

 */

const Q = require('q');
const grpc = require('grpc');

const config = require('../../../config/config');
const services = require('../../../../static_codegen/traceReader_grpc_pb');
const messages = require('../../../../static_codegen/traceReader_pb');
const searchResultsTransformer = require('./searchResultsTransformer');
const errorConverter = require('../../utils/errorConverter');
const protobufConverter = require('./protobufConverter');
const searchRequestBuilder = require('./searchRequestBuilder');
const objectUtils = require('../../utils/objectUtils');
const fetcher = require('../../fetchers/grpcFetcher');

const rawTraceFetcher = fetcher('getRawTrace');
const rawSpanFetcher = fetcher('getRawSpan');

const connector = {};

const client = new services.TraceReaderClient(
    `${config.connectors.traces.haystackHost}:${config.connectors.traces.haystackPort}`,
    grpc.credentials.createInsecure()); // TODO make client secure

function generateCallDeadline() {
    return new Date().setMilliseconds(new Date().getMilliseconds() + config.upstreamTimeout);
}

connector.getServices = () => {
    const deferred = Q.defer();

    const request = new messages.FieldValuesRequest();
    request.setFieldname('serviceName');

    client.getFieldValues(request,
        {deadline: generateCallDeadline()},
        (error, result) => {
            if (error || !result) {
                deferred.reject(errorConverter.fromGrpcError(error));
            } else {
                deferred.resolve(result.getValuesList());
            }
        });

    return deferred.promise;
};

connector.getOperations = (serviceName) => {
    const deferred = Q.defer();

    const service = new messages.Field();
    service.setName('serviceName');
    service.setValue(serviceName);

    const request = new messages.FieldValuesRequest();
    request.setFieldname('operationName');
    request.setFiltersList(new messages.Field());
    request.setFiltersList([service]);

    client.getFieldValues(request,
        {deadline: generateCallDeadline()},
        (error, result) => {
            if (error || !result) {
                deferred.reject(errorConverter.fromGrpcError(error));
            } else {
                deferred.resolve(result.getValuesList());
            }
        });

    return deferred.promise;
};

connector.getTrace = (traceId) => {
    const deferred = Q.defer();

    const request = new messages.TraceRequest();
    request.setTraceid(traceId);

    client.getTrace(request,
        {deadline: generateCallDeadline()},
        (error, result) => {
            if (error || !result) {
                deferred.reject(errorConverter.fromGrpcError(error));
            } else {
                deferred.resolve(protobufConverter.toTraceJson(messages.Trace.toObject(false, result)));
            }
        });

    return deferred.promise;
};

connector.getRawTrace = (traceId) => {
    const request = new messages.TraceRequest();
    request.setTraceid(traceId);

    return rawTraceFetcher
    .fetch(request)
    .then(result => protobufConverter.toTraceJson(messages.Trace.toObject(false, result)));
};

connector.getRawSpan = (traceId, spanId) => {
    const request = new messages.SpanRequest();
    request.setTraceid(traceId);
    request.setSpanid(spanId);

    return rawSpanFetcher
    .fetch(request)
    .then(result => protobufConverter.toSpanJson(messages.Span.toObject(false, result)));
};

connector.findTraces = (query) => {
    const deferred = Q.defer();
    const traceId = objectUtils.getPropIgnoringCase(query, 'traceId');

    if (traceId) {
        // if search is for a singe trace, perform getTrace instead of search
        const request = new messages.TraceRequest();
        request.setTraceid(traceId);

        client.getTrace(request,
            {deadline: generateCallDeadline()},
            (error, result) => {
                if (error || !result) {
                    deferred.reject(errorConverter.fromGrpcError(error));
                } else {
                    const pbTrace = messages.Trace.toObject(false, result);
                    const jsonTrace = protobufConverter.toTraceJson(pbTrace);

                    deferred.resolve(searchResultsTransformer.transform([jsonTrace], query));
                }
            });
    } else {
        client.searchTraces(searchRequestBuilder.buildRequest(query),
            {deadline: generateCallDeadline()},
            (error, result) => {
                if (error || !result) {
                    deferred.reject(errorConverter.fromGrpcError(error));
                } else {
                    const pbTraceResult = messages.TracesSearchResult.toObject(false, result);
                    const jsonTraceResults = pbTraceResult.tracesList.map(pbTrace => protobufConverter.toTraceJson(pbTrace));

                    deferred.resolve(searchResultsTransformer.transform(jsonTraceResults, query));
                }
            });
    }

    return deferred.promise;
};

module.exports = connector;
