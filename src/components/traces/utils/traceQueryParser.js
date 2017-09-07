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
    .filter(key => query[key] && key !== 'timePreset' && key !== 'startTime' && key !== 'endTime')
    .map(key => `${encodeURIComponent(key)}=${query[key]}`)
    .join(' ');

export const toQueryUrl = query => Object
    .keys(query)
    .filter(key => query[key])
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');

export const toQuery = (query) => {
    const queryDict = {};

    if (!query || query.length <= 1) return {};

    query.substr(1)
        .split('&')
        .forEach((item) => {
            queryDict[decodeURIComponent(item.split('=')[0])] = decodeURIComponent(item.split('=')[1]);
        });
    return queryDict;
};

export const searchForService = query => Object.keys(query).includes('serviceName');

