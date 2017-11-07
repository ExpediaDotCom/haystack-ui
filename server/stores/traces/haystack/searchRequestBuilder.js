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

const requestBuilder = {};
const messages = require('../../../../static_codegen/traceReader_pb');
const rangeConverter = require('../../utils/rangeConverter');

const reservedField = ['timePreset', 'startTime', 'endTime'];
const RESULTS_LIMIT = 40;

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

requestBuilder.buildRequest = (query) => {
    const request = new messages.TracesSearchRequest();
    request.setFieldsList(createFieldsList(query));
    request.setStarttime((query.startTime && parseInt(query.startTime, 10)) || ((Date.now() * 1000) - rangeConverter.toDuration(query.timePreset)));
    request.setEndtime((query.endTime && parseInt(query.endTime, 10)) || Date.now() * 1000);
    request.setLimit(RESULTS_LIMIT);

    return request;
};

module.exports = requestBuilder;
