/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

const whitespaceAroundEqualsRegex = /\s*=\s*/g;
const keyValuePairRegex = /\w=\w/;
const whitespaceRegex = /\s+/g;
const primaryFields = ['serviceName', 'operationName', 'timePreset', 'startTime', 'endTime'];

export const queryIsValid = queryString =>
    queryString
        // Trim whitespace, check for whitespace before and after =,
        .trim().replace(whitespaceAroundEqualsRegex, '=')
        // Split kv pairs
        .split(whitespaceRegex)
        // Check individually for key=value
        .every(kvPair => keyValuePairRegex.test(kvPair));

export const dateIsValid = (start, end) => {
    // preset timers will always be valid; no need to test validation
    if (start) {
        // ensure the end time is not before the start time, and the start time is not later than current time
        return (end > start) && (Date.now() - start > 0);
    }
    return true;
};

export const parseQueryString = (queryString) => {
    const keyValuePairs = queryString.replace(whitespaceAroundEqualsRegex, '=').split(whitespaceRegex);

    const parsedQueryString = {};

    keyValuePairs.forEach((pair) => {
        const keyValue = pair.trim().split('=');
        parsedQueryString[keyValue[0]] = keyValue[1];
    });

    return parsedQueryString;
};

export const toQueryString = query => Object
    .keys(query)
    .filter(key => query[key] && !primaryFields.includes(key))
    .map(key => `${encodeURIComponent(key)}=${query[key]}`)
    .join(' ');

export const toFieldsKvString = query => Object
    .keys(query)
    .filter(key => query[key])
    .map(key => `${encodeURIComponent(key)}=${query[key]}`)
    .join(' ');


export const toFieldsObject = (kvString) => {
  const keyValuePairs = kvString.replace(whitespaceAroundEqualsRegex, '=').split(whitespaceRegex);

  const parsedFields = {};

  keyValuePairs.forEach((pair) => {
    const keyValue = pair.trim().split('=');
    parsedFields[keyValue[0]] = keyValue[1];
  });

  return parsedFields;
};

export const extractSecondaryFields = (query) => {
  const fields = {};

  Object
      .keys(query)
      .filter(key => query[key] && !primaryFields.includes(key))
      .forEach((key) => { fields[key] = query[key]; });

  return fields;
};

export const isValidFieldKvString = queryString =>
    queryString
    // Trim whitespace, check for whitespace before and after =,
        .trim().replace(whitespaceAroundEqualsRegex, '=')
    // Split kv pairs
        .split(whitespaceRegex)
        // Check individually for key=value
        .every(kvPair => keyValuePairRegex.test(kvPair));
