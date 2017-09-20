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

function convertSuccessTag(tags) {
  const successTag = tags.find(tag => tag.key.toLowerCase() === 'success');
  if (successTag) {
    successTag.key = 'error';
    successTag.value = successTag.value === 'false' ? 'true' : 'false';
  }
}

function convertMethodUriTag(tags) {
  const methodUriTag = tags.find(tag => tag.key.toLowerCase() === 'methoduri');
  if (methodUriTag) {
    methodUriTag.key = 'url';
  }
}

function toHaystackTags(binaryAnnotations) {
  const tags = binaryAnnotations.map(annotation => ({
    key: annotation.key,
    value: annotation.value
  }));

  convertSuccessTag(tags);
  convertMethodUriTag(tags);

  return tags;
}

function toHaystackLogs(annotations) {
  return annotations.map(annotation => ({
    timestamp: annotation.timestamp,
    fields: [
      {
        key: 'event',
        value: annotation.value
      }]
  }));
}

function getAnnotationFromValue(annotations, value) {
  return annotations.find(annotation => annotation.value && annotation.value.toLowerCase() === value);
}

function getServiceNameFromAnnotation(annotation) {
  return annotation && annotation.endpoint && annotation.endpoint.serviceName;
}

function getServiceNameFromAnnotationList(binaryAnnotations) {
  const binaryAnnotationWithService = binaryAnnotations.find(annotation => annotation.endpoint && annotation.endpoint.serviceName);

  return getServiceNameFromAnnotation(binaryAnnotationWithService);
}

function getServiceName(zipkinSpan) {
  const serverReceived = getAnnotationFromValue(zipkinSpan.annotations, 'sr');
  const serverSend = getAnnotationFromValue(zipkinSpan.annotations, 'ss');
  const clientSend = getAnnotationFromValue(zipkinSpan.annotations, 'cs');
  const clientReceived = getAnnotationFromValue(zipkinSpan.annotations, 'cr');

  return getServiceNameFromAnnotation(serverReceived)
      || getServiceNameFromAnnotation(serverSend)
      || getServiceNameFromAnnotation(clientSend)
      || getServiceNameFromAnnotation(clientReceived)
      || getServiceNameFromAnnotationList(zipkinSpan.binaryAnnotations)
      || getServiceNameFromAnnotationList(zipkinSpan.annotations)
      || 'not_found';
}

const converter = {};

converter.toHaystackTrace = zipkinTrace => zipkinTrace.map(zipkinSpan => ({
  traceId: zipkinSpan.traceId,
  spanId: zipkinSpan.id,
  parentSpanId: zipkinSpan.parentId || null,
  serviceName: getServiceName(zipkinSpan),
  operationName: zipkinSpan.name || 'not_found',
  startTime: zipkinSpan.timestamp,
  duration: zipkinSpan.duration,
  tags: toHaystackTags(zipkinSpan.binaryAnnotations),
  logs: toHaystackLogs(zipkinSpan.annotations)
}));

converter.toHaystackSearchResult = (zipkinTraces, query) => {
  const haystackTraces = zipkinTraces.map(zipkinTrace => converter.toHaystackTrace(zipkinTrace));
  return searchResultsTransformer.transform(haystackTraces, query);
};

module.exports = converter;
