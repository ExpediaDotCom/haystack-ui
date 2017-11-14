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

const converter = {};

function toTagJson(pbTag) {
    return {
        key: pbTag.key,
        value: pbTag.vstr || pbTag.vlong || pbTag.vdouble || pbTag.vbool || pbTag.vbytes
    };
}

function toLogJson(pbLog) {
    return {
        timestamp: pbLog.timestamp,
        fields: pbLog.fieldsList.map(pbTag => toTagJson(pbTag))
    };
}

converter.toSpanJson = pbSpan => ({
    traceId: pbSpan.traceid,
    spanId: pbSpan.spanid,
    serviceName: pbSpan.servicename,
    operationName: pbSpan.operationname,
    startTime: pbSpan.starttime,
    duration: pbSpan.duration,
    logs: pbSpan.logsList && pbSpan.logsList.map(pbLog => toLogJson(pbLog)),
    tags: pbSpan.logsList && pbSpan.tagsList.map(pbTag => toTagJson(pbTag))
});

converter.toTraceJson = pbTrace => pbTrace.childspansList.map(pbSpan => converter.toSpanJson(pbSpan));

module.exports = converter;
