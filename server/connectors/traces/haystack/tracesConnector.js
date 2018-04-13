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

const messages = require('../../../../static_codegen/traceReader_pb');
const searchResultsTransformer = require('./search/searchResultsTransformer');
const callGraphResultTransformer = require('./protobufConverters/callGraphConverter');
const protobufConverter = require('./protobufConverters/traceConverter');
const searchRequestBuilder = require('./search/searchRequestBuilder');
const objectUtils = require('../../utils/objectUtils');
const fetcher = require('../../fetchers/grpcFetcher');

const fieldValueFetcher = fetcher('getFieldValues');
const fieldNameFetcher = fetcher('getFieldNames');
const traceFetcher = fetcher('getTrace');
const rawTraceFetcher = fetcher('getRawTrace');
const rawSpanFetcher = fetcher('getRawSpan');
const tracesSearchFetcher = fetcher('searchTraces');
const traceCallGraphFetcher = fetcher('getTraceCallGraph');

const connector = {};

connector.getServices = () => {
    const request = new messages.FieldValuesRequest();
    request.setFieldname('serviceName');

    return fieldValueFetcher
    .fetch(request)
    .then(result => result.getValuesList());
};

connector.getSearchableKeys = () => {
    const request = new messages.Empty();

    return fieldNameFetcher
        .fetch(request)
        .then(result => result.getValuesList());
};

connector.getOperations = (serviceName) => {
    const service = new messages.Field();
    service.setName('serviceName');
    service.setValue(serviceName);

    const request = new messages.FieldValuesRequest();
    request.setFieldname('operationName');
    request.setFiltersList(new messages.Field());
    request.setFiltersList([service]);

    return fieldValueFetcher
    .fetch(request)
    .then(result => result.getValuesList());
};

connector.getTrace = (traceId) => {
    const request = new messages.TraceRequest();
    request.setTraceid(traceId);

    return traceFetcher
    .fetch(request)
    .then(result => protobufConverter.toTraceJson(messages.Trace.toObject(false, result)));
};

connector.findTraces = (query) => {
    const traceId = objectUtils.getPropIgnoringCase(query, 'traceId');

    if (traceId) {
        // if search is for a singe trace, perform getTrace instead of search
        const request = new messages.TraceRequest();
        request.setTraceid(traceId);

        return traceFetcher
        .fetch(request)
        .then((result) => {
            const pbTrace = messages.Trace.toObject(false, result);
            const jsonTrace = protobufConverter.toTraceJson(pbTrace);

            return searchResultsTransformer.transform([jsonTrace], query);
        });
    }

    return tracesSearchFetcher
    .fetch(searchRequestBuilder.buildRequest(query))
    .then((result) => {
        const pbTraceResult = messages.TracesSearchResult.toObject(false, result);
        const jsonTraceResults = pbTraceResult.tracesList.map(pbTrace => protobufConverter.toTraceJson(pbTrace));

        return searchResultsTransformer.transform(jsonTraceResults, query);
    });
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

connector.getLatencyCost = (traceId) => {
    const request = new messages.TraceRequest();
    request.setTraceid(traceId);

    return traceCallGraphFetcher
    .fetch(request)
    .then(result => callGraphResultTransformer.transform(messages.TraceCallGraph.toObject(false, result)));
};

module.exports = connector;
