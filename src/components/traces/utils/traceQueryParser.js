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

export const queryIsValid = (queryString) => {
    let validity = true;
    queryString.split(' ').map((x) => { if (!RegExp(/\w=\w/).test(x)) { validity = false; } return null; });
    return validity;
};

export const dateIsValid = (start, end) => {
    if (start) {
        return (end > start) && (Date.now() - start > 0);
    }
    return true;
};

export const parseQueryString = (queryString) => {
    const keyValuePairs = queryString.split(' ');

    const parsedQueryString = {};

    keyValuePairs.forEach((pair) => {
        const keyValue = pair.trim().split('=');
        parsedQueryString[keyValue[0]] = keyValue[1];
    });

    return parsedQueryString;
};

export const toQueryUrl = query => Object
    .keys(query)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');

export const toQueryString = query => Object
    .keys(query)
    .filter(key => query[key] && key !== 'timePreset' && key !== 'startTime' && key !== 'endTime')
    .map(key => `${encodeURIComponent(key)}=${query[key]}`)
    .join(' ');

export const toQuery = (query) => {
    const queryDict = {};

    if (!query || query.length <= 1) return {};

    query.substr(1)
        .split('&')
        .forEach((item) => {
            const key = item.split('=')[0].trim();
            const value = item.split('=')[1].trim();
            if (key && value) {
                queryDict[decodeURIComponent(item.split('=')[0])] = decodeURIComponent(item.split('=')[1]);
            }
        });
    return queryDict;
};
