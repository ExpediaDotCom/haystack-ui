/*

 *  Copyright 2017 Expedia, Inc.
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
const rangeConverter = require('../../utils/rangeConverter');

const store = {};

const client = new services.TraceReaderClient(
    `${config.stores.traces.haystackHost}:${config.stores.traces.haystackPort}`,
    grpc.credentials.createInsecure());

const reservedField = ['timePreset', 'startTime', 'endTime'];

function generateCallDeadline() {
    return new Date().setMilliseconds(new Date().getMilliseconds() + config.upstreamTimeout);
}

function createFieldsList(query) {
    return Object.keys(query)
        .filter(key => query[key] && !reservedField.includes(key))
        .map((key) => {
            const field = new messages.Field();
            field.setName(key);
            field.setValue(query[key]);

            return field;
        });
}

function createTraceSearchRequest(query) {
    const request = new messages.TracesSearchRequest();
    request.setFieldsList(createFieldsList(query));
    request.setStarttime((query.startTime && parseInt(query.startTime, 10)) || ((Date.now() * 1000) - rangeConverter.toDuration(query.timePreset)));
    request.setEndtime((query.endTime && parseInt(query.endTime, 10)) || Date.now() * 1000);
    request.setLimit(40);

    return request;
}

store.getServices = () => {
    const deferred = Q.defer();

    const request = new messages.FieldValuesRequest();
    request.setFieldname('service');

    client.getFieldValues(request, {deadline: generateCallDeadline()},
        (error, result) => {
            if (error || !result) {
                deferred.reject({error, result});
            } else {
                deferred.resolve(result);
            }
        });

    return deferred.promise;
};

store.getOperations = (serviceName) => {
    const deferred = Q.defer();

    const service = new messages.Field();
    service.setName('service');
    service.setValue(serviceName);

    const request = new messages.FieldValuesRequest();
    request.setFieldname('operation');
    request.setFiltersList(new messages.Field());

    client.getFieldValues(request, {deadline: generateCallDeadline()},
        (error, result) => {
            if (error || !result) {
                deferred.reject({error, result});
            } else {
                deferred.resolve(result.getFieldValues());
            }
        });

    return deferred.promise;
};

store.getTrace = (traceId) => {
    const deferred = Q.defer();

    const request = new messages.TraceRequest();
    request.setTraceid(traceId);

    client.getTrace(request, (error, result) => {
        if (error || !result) {
            deferred.reject({error, result});
        } else {
            deferred.resolve(result.getTrace());
        }
    });

    return deferred.promise;
};

store.findTraces = (query) => {
    const deferred = Q.defer();

    if (query.traceId) {
        // if search is for a singe trace, perform getTrace instead of search
        const request = new messages.TraceRequest();
        request.setTraceid(query.traceId);

        client.getTrace(request, {deadline: generateCallDeadline()},
            (error, result) => {
                if (error || !result) {
                    deferred.reject({error, result});
                } else {
                    deferred.resolve(
                        searchResultsTransformer.transform([result.getTrace()],
                            query));
                }
            });
    } else {
        client.searchTraces(createTraceSearchRequest(query), {deadline: generateCallDeadline()},
            (error, result) => {
                if (error || !result) {
                    deferred.reject({error, result});
                } else {
                    deferred.resolve(
                        searchResultsTransformer.transform(
                            result.getTracesList(), query));
                }
            });
    }

    return deferred.promise;
};

module.exports = store;
