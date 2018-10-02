/*
 * Copyright 2018 Expedia Group
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
const searchResultsTransformer = require('../haystack/search/searchResultsTransformer');

function toHaystackLog(annotation) {
  return {
    timestamp: annotation.timestamp,
    fields: [
      {
        key: 'event',
        value: annotation.value
      }
    ]
  };
}

function normalizeTraceId(traceId) {
  if (traceId.length > 16) {
    return traceId.padStart(32, '0');
  }
  return traceId.padStart(16, '0');
}

// NOTE: 'not_found' is different than Zipkin's 'unknown' default
function sanitizeName(name) {
  return (name && name !== '' && name !== 'unknown') ? name : 'not_found';
}

// Note: the tag 'success' is not something defined in Zipkin, nor commonly used
function convertSuccessTag(tags) {
  const successTag = tags.find(tag => tag.key.toLowerCase() === 'success');
  if (successTag) {
    successTag.key = 'error';
    successTag.value = successTag.value === 'false' ? 'true' : 'false';
  }
}

// Note: the tag 'methoduri' is not something defined in Zipkin, nor commonly used
function convertMethodUriTag(tags) {
  const methodUriTag = tags.find(tag => tag.key.toLowerCase() === 'methoduri');
  if (methodUriTag) {
    methodUriTag.key = 'url';
  }
}

function toHaystackSpan(span) {
  const res = {
    traceId: normalizeTraceId(span.traceId)
  };

  // take care not to create self-referencing spans even if the input data is incorrect
  const id = span.id.padStart(16, '0');
  if (span.parentId) {
    const parentId = span.parentId.padStart(16, '0');
    if (parentId !== id) {
      res.parentSpanId = parentId;
    }
  }

  res.spanId = id;

  if (span.localEndpoint) {
    res.serviceName = sanitizeName(span.localEndpoint.serviceName);
  } else {
    res.serviceName = 'not_found';
  }

  res.operationName = sanitizeName(span.name);

  // Don't report timestamp and duration on shared spans (should be server, but not necessarily)
  if (!span.shared) {
    if (span.timestamp) res.startTime = span.timestamp;
    if (span.duration) res.duration = span.duration;
  }

  let startTs = span.timestamp || 0;
  let endTs = startTs && span.duration ? startTs + span.duration : 0;
  let msTs = 0;
  let wsTs = 0;
  let wrTs = 0;
  let mrTs = 0;

  let begin;
  let end;

  let kind = span.kind;

  // scan annotations in case there are better timestamps, or inferred kind
  (span.annotations || []).forEach((a) => {
    switch (a.value) {
      case 'cs':
        kind = 'CLIENT';
        if (a.timestamp < startTs) startTs = a.timestamp;
        break;
      case 'sr':
        kind = 'SERVER';
        if (a.timestamp < startTs) startTs = a.timestamp;
        break;
      case 'ss':
        kind = 'SERVER';
        if (a.timestamp > endTs) endTs = a.timestamp;
        break;
      case 'cr':
        kind = 'CLIENT';
        if (a.timestamp > endTs) endTs = a.timestamp;
        break;
      case 'ms':
        kind = 'PRODUCER';
        msTs = a.timestamp;
        break;
      case 'mr':
        kind = 'CONSUMER';
        mrTs = a.timestamp;
        break;
      case 'ws':
        wsTs = a.timestamp;
        break;
      case 'wr':
        wrTs = a.timestamp;
        break;
      default:
    }
  });

  switch (kind) {
    case 'CLIENT':
      begin = 'cs';
      end = 'cr';
      break;
    case 'SERVER':
      begin = 'sr';
      end = 'ss';
      break;
    case 'PRODUCER':
      begin = 'ms';
      end = 'ws';
      if (startTs === 0 || (msTs !== 0 && msTs < startTs)) {
        startTs = msTs;
      }
      if (endTs === 0 || (wsTs !== 0 && wsTs > endTs)) {
        endTs = wsTs;
      }
      break;
    case 'CONSUMER':
      if (startTs === 0 || (wrTs !== 0 && wrTs < startTs)) {
        startTs = wrTs;
      }
      if (endTs === 0 || (mrTs !== 0 && mrTs > endTs)) {
        endTs = mrTs;
      }
      if (endTs !== 0 || wrTs !== 0) {
        begin = 'wr';
        end = 'mr';
      } else {
        begin = 'mr';
      }
      break;
    default:
  }

  const beginAnnotation = startTs && begin;
  const endAnnotation = endTs && end;

  res.logs = []; // prefer empty to undefined for arrays

  if (beginAnnotation) {
    res.logs.push(toHaystackLog({
      value: begin,
      timestamp: startTs
    }));
  }

  (span.annotations || []).forEach((a) => {
    if (beginAnnotation && a.value === begin) return;
    if (endAnnotation && a.value === end) return;
    res.logs.push(toHaystackLog(a));
  });

  if (endAnnotation) {
    res.logs.push(toHaystackLog({
      value: end,
      timestamp: endTs
    }));
  }

  res.tags = []; // prefer empty to undefined for arrays
  const keys = Object.keys(span.tags || {});
  if (keys.length > 0) {
    res.tags = keys.map(key => ({
      key,
      value: span.tags[key]
    }));

    // handle special tags defined by Haystack
    convertSuccessTag(res.tags);
    convertMethodUriTag(res.tags);
  }
  if (span.remoteEndpoint) {
    const remoteService = sanitizeName(span.remoteEndpoint.serviceName);
    if (remoteService !== 'not_found') {
      res.tags.push({
        key: 'remote.service_name',
        value: remoteService
      });
    }
  }

  return res;
}

const converter = {};

converter.toHaystackSpan = toHaystackSpan; // exported for testing

converter.toHaystackTrace = zipkinTrace =>
  zipkinTrace.map(zipkinSpan => toHaystackSpan(zipkinSpan));

converter.toHaystackSearchResult = (zipkinTraces, query) => {
  const haystackTraces = zipkinTraces.map(zipkinTrace => converter.toHaystackTrace(zipkinTrace));
  return searchResultsTransformer.transform(haystackTraces, query);
};

module.exports = converter;
