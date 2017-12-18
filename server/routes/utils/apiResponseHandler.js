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

const cache = require('./cache');

const responseHandler = {};
responseHandler.handleResponsePromiseWithCaching = (response, next, url, maxAge, apiCall) => {
    let item = cache.get(url);
    if (!item) {
        return apiCall().then(
            (result) => {
                item = result;
                response.json(item);
                cache.set(url, item, maxAge);
                return item;
            },
            err => next(err)
        ).done();
    }
    response.json(item);
    return item;
};

responseHandler.handleResponsePromise = (response, next) => operation => operation().then(
        result => response.json(result),
        err => next(err)
    ).done();

module.exports = responseHandler;
