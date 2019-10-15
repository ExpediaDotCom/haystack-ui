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
import _ from 'lodash';

function nestedObjectToQuery(parentKey, key, value) {
    return `${encodeURIComponent(parentKey)}.${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

export const convertSearchToUrlQuery = (search) => {
    console.log(search);
    const uriComponents = Object.keys(search)
        .filter(key => search[key])
        .map((key) => {
            const value = search[key];
            if (_.isObject(value)) {
                return Object.keys(value).map(valueKey => nestedObjectToQuery(key, valueKey, value[valueKey]));
            }

            return [`${encodeURIComponent(key)}=${encodeURIComponent(search[key])}`];
        });

    return _.flatten(uriComponents).join('&');
};

export const convertUrlQueryToSearch = (query) => {
    const search = {};

    if (!query || query.length <= 1) return {};

    query.substr(1)
        .split('&')
        .forEach((item) => {
            const key = decodeURIComponent(item.split('=')[0]);
            const value = decodeURIComponent(item.split('=')[1]);
            const nestedKey = key.split('.');

            if (nestedKey.length === 1) {
                search[key] = value;
            } else {
                const nested = search[nestedKey[0]] || {};
                nested[nestedKey[1]] = value;
                search[nestedKey[0]] = nested;
            }
        });

    return search;
};
