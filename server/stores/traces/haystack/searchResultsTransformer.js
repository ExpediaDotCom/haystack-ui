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

function calculateShadowDuration(spans) {
  if (!spans.length) return 0;

  const shadows = _.flatMap(spans, span => [{time: span.startTime, value: 1}, {time: span.startTime + span.duration, value: -1}]);

  const sortedShadows = shadows.sort((a, b) => a.time - b.time);

  let runningCount = 0;
  let lastStartTimestamp = sortedShadows[0].time;
  let runningShadowDuration = 0;

  for (let i = 0; i < sortedShadows.length; i += 1) {
      if (runningCount === 1 && sortedShadows[i].value === -1) {
          runningShadowDuration += sortedShadows[i].time - lastStartTimestamp;
      }

      if (runningCount === 0 && sortedShadows[i].value === 1) {
          lastStartTimestamp = sortedShadows[i].time;
      }

      runningCount += sortedShadows[i].value;
  }

  return runningShadowDuration;
}

function findTag(tags, tagName) {
  const foundTag = tags.find(tag => tag.key && tag.key.toLowerCase() === tagName);
  return foundTag && foundTag.value;
}

function isSpanError(span) {
  return findTag(span.tags, 'error') === 'true' || findTag(span.tags, 'error') === true;
}

function createServicesSummary(trace) {
  const services = _.countBy(trace, span => span.serviceName);

  return _.keys(services).map(service => ({
    name: service,
    spanCount: services[service]
  }));
}

function createQueriedServiceSummary(trace, serviceName, endToEndDuration) {
  const serviceSpans = trace.filter(span => span.serviceName === serviceName);

  const serviceShadowDuration = calculateShadowDuration(serviceSpans);
  const percent = Math.ceil((serviceShadowDuration / endToEndDuration) * 100);

  return serviceName && serviceSpans && {
        duration: serviceShadowDuration,
        durationPercent: percent,
        error: serviceSpans.some(span => isSpanError(span))
      };
}

function createQueriedOperationSummary(trace, operationName, endToEndDuration) {
  const operationSpans = trace.filter(span => span.operationName === operationName);
  const operationShadowDuration = calculateShadowDuration(operationSpans);
  const percent = Math.floor((operationShadowDuration / endToEndDuration) * 100);

  return operationName && operationSpans && {
        duration: operationShadowDuration,
        durationPercent: percent,
        error: operationSpans.some(span => isSpanError(span))
      };
}

function toSearchResult(trace, query) {
  const rootSpan = trace.find(span => !span.parentSpanId);
  const root = {
    url: findTag(rootSpan.tags, 'url') || '',
    serviceName: rootSpan.serviceName,
    operationName: rootSpan.operationName,
    duration: rootSpan.duration,
    error: isSpanError(rootSpan)
  };

  const services = createServicesSummary(trace);

  const endToEndDuration = calculateEndToEndDuration(trace);
  const queriedService = createQueriedServiceSummary(trace, query.serviceName, endToEndDuration);
  const queriedOperation = createQueriedOperationSummary(trace, query.operationName, endToEndDuration);

  return {
    traceId: rootSpan.traceId,
    spanCount: trace.length,
    services,
    root,
    queriedService,
    queriedOperation,
    startTime: rootSpan.startTime,               // start time of the root span
    duration: endToEndDuration,                  // end-to-end duration
    error: trace.some(span => isSpanError(span))
  };
}

transformer.transform = (traces, query) => traces.map(trace => toSearchResult(trace, query));

module.exports = transformer;
