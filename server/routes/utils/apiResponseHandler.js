/*
 * Copyright 2018 Expedia, Inc.
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
const _ = require('lodash');
const metrics = require('../../support/metrics');

const responseHandler = {};

function runOp(operation, url, maxAge, response, next) {
    operation()
        .then((result) => {
                if (!_.isEmpty(result)) {
                    cache.set(url, result, maxAge);
                }
                if (response) {
                    response.json(result);
                }
            },
            (err) => {
                if (next) {
                    next(err);
                }
            }
        ).done();
}

responseHandler.handleResponsePromiseWithCaching = (response, next, url, maxAge) => (operation) => {
    const cachedItem = cache.get(url);
    if (cachedItem) {
        // check if the last cache.get entry was stale and hence expired
        const isExpired = !cache.get(url);
        if (isExpired) {
            // set the cache key again so that next cache call doesn't force to make a downstream call
            // but make a async refresh for the given key.
            cache.set(url, cachedItem, maxAge);
            runOp(operation, url, maxAge);
        }
        response.json(cachedItem);
    } else {
        runOp(operation, url, maxAge, response, next);
    }
};

responseHandler.handleResponsePromise = (response, next, pathName) => (operation) => {
    const timer = metrics.timer(pathName).start();

    operation()
    .then(result => response.json(result), err => next(err))
    .fin(() => timer.end())
    .done();
};

module.exports = responseHandler;
