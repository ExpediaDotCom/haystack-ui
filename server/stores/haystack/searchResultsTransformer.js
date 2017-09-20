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


function getBinaryAnnotation(span, key) {
  return span.binaryAnnotations ? span.binaryAnnotations.find(annotation => annotation.key === key) : null;
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


function toSearchResult(trace, query) {
  const rootSpan = trace.find(span => !span.parentId);
  const services = _.countBy(trace,
      span => getServiceName(span));
  const mappedServices = _.keys(services).map((service) => {
    const spans = trace.filter(span => getServiceName(span) === service);
    return {
      name: service,
      spanCount: services[service],
      duration: calcEndToEndDuration(spans)
    };
  });

  const queriedSvcDur = mappedServices.find(s => s.name ===
      (query.serviceName || rootSpan.serviceName)).duration || 0.001;
  const duration = calcEndToEndDuration(trace) || 0.001;
  const queriedSvcDurPerc = (queriedSvcDur / duration) * 100;
  const urlAnnotation = getBinaryAnnotation(rootSpan, 'url');
  const methodUriAnnotation = getBinaryAnnotation(rootSpan, 'methodUri');
  const rootSpanSuccess = getSuccess(rootSpan);
  const queriedOperationSuccess = (query.operationName !== 'all')
      ? getSuccess(trace.find(span => span.name === query.operationName))
      : null;
  const queriedServiceSuccess = !(trace.filter(
      span => getServiceName(span) === query.serviceName)).some(
      span => getSuccess(span) === false);

  return {
    traceId: trace[0].traceId,
    services: mappedServices,
    root: {
      url: (urlAnnotation && urlAnnotation.value) ||
      (methodUriAnnotation && methodUriAnnotation.value) || '',
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
}

transformer.transform = (traces, query) => traces.map(trace => toSearchResult(trace, query));

module.exports = transformer;
