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
const _ = require('lodash');

const transformer = {};

function calculateEndToEndDuration(spans) {
  const startTime = spans
                      .map(span => span.startTime)
                      .reduce((earliest, cur) => Math.min(earliest, cur));
  const endTime = spans
                      .map(span => (span.startTime + span.duration))
                      .reduce((latest, cur) => Math.max(latest, cur));

  const difference = endTime - startTime;
  return difference || 1;
}

function calculateCumulativeDuration(spans) {
  return spans.reduce((running, span) => running + span.duration, 0);
}

function findTag(tags, tagName) {
  const foundTag = tags.find(tag => tag.key && tag.key.toLowerCase() === tagName);
  return foundTag && foundTag.value;
}

function isSpanError(span) {
  return findTag(span.tags, 'error') === 'true';
}

function createServicesSummary(trace) {
  const services = _.countBy(trace, span => span.serviceName);

  return _.keys(services).map(service => ({
    name: service,
    spanCount: services[service]
  }));
}

// TODO instead of cumulative time, use shadow time on total timeline
function createQueriedServiceSummary(trace, serviceName, totalCumulativeDuration) {
  const serviceSpans = trace.filter(span => span.serviceName === serviceName);
  const cumulativeDuration = calculateCumulativeDuration(serviceSpans);
  const percent = Math.ceil((cumulativeDuration / totalCumulativeDuration) * 100);

  return serviceName && serviceSpans && {
        duration: cumulativeDuration,
        durationPercent: percent,
        error: serviceSpans.some(span => isSpanError(span))
      };
}

// TODO instead of cumulative time, use shadow time on total timeline
function createQueriedOperationSummary(trace, operationName, totalCumulativeDuration) {
  const operationSpans = trace.filter(span => span.operationName === operationName);
  const cumulativeDuration = calculateCumulativeDuration(operationSpans);
  const percent = Math.floor((cumulativeDuration / totalCumulativeDuration) * 100);

  return operationName && operationSpans && {
        duration: cumulativeDuration,
        durationPercent: percent,
        error: operationSpans.some(span => isSpanError(span))
      };
}

function toSearchResult(trace, query) {
  const rootSpan = trace.find(span => !span.parentSpanId);
  const root = {
    url: findTag(rootSpan.tags, 'url') || null,
    serviceName: rootSpan.serviceName,
    operationName: rootSpan.operationName,
    duration: rootSpan.duration,
    error: isSpanError(rootSpan)
  };

  const services = createServicesSummary(trace);

  const totalCumulativeDuration = calculateCumulativeDuration(trace);
  const queriedService = createQueriedServiceSummary(trace, query.serviceName, totalCumulativeDuration);
  const queriedOperation = createQueriedOperationSummary(trace, query.operationName, totalCumulativeDuration);

  return {
    traceId: rootSpan.traceId,
    spanCount: trace.length,
    services,
    root,
    queriedService,
    queriedOperation,
    startTime: rootSpan.startTime,               // start time of the root span
    duration: calculateEndToEndDuration(trace),  // end-to-end duration
    error: root.error
    || (queriedService && queriedService.error)
    || (queriedOperation && queriedOperation.error)  // error on root or queried service or queried operation
  };
}

transformer.transform = (traces, query) => traces.map(trace => toSearchResult(trace, query));

module.exports = transformer;
