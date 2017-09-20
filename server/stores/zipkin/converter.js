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
const searchResultsTransformer = require('../haystack/searchResultsTransformer');

function toHaystackTags(binaryAnnotations) {
  return binaryAnnotations.map(annotation => ({
    key: annotation.key,
    value: annotation.value
  }));
}

function toHaystackLogs(annotations) {
  return annotations.map(annotation => ({
    timestamp: annotation.timestamp / 1000,
    fields: [
      {
        key: 'event',
        value: annotation.value
      }]
  }));
}

function getServiceName(zipkinSpan) {
  const serverReceived = zipkinSpan.annotations.find(
      annotation => annotation.value === 'sr');
  const serverSend = zipkinSpan.annotations.find(
      annotation => annotation.value === 'ss');

  return (serverReceived && serverReceived.endpoint &&
      serverReceived.endpoint.serviceName)
      || (serverSend && serverSend.endpoint && serverSend.endpoint.serviceName)
      || (zipkinSpan.binaryAnnotations
      && zipkinSpan.binaryAnnotations[0]
      && zipkinSpan.binaryAnnotations[0].endpoint
      && zipkinSpan.binaryAnnotations[0].endpoint.serviceName)
      || 'Not Found';
}

const converter = {};

converter.toHaystackTrace = zipkinTrace => zipkinTrace.map(zipkinSpan => ({
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

converter.toHaystackSearchResult = (zipkinTraces, query) => searchResultsTransformer.transform(zipkinTraces, query);

module.exports = converter;
