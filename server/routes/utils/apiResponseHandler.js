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

const responseHandler = {};

function runOp(operation, url, response, next) {
    operation()
        .then((result) => {
                if (!_.isEmpty(result)) {
                    const resultWithTimestamp = {
                        data: result,
                        fetchTimestamp: new Date().getTime()
                    };
                    cache.set(url, resultWithTimestamp);
                }
                if (response) {
                    response.json(result);
                }
            },
            err => {
                if (next) {
                    next(err);
                }
            }
        ).done();
}

responseHandler.handleResponsePromiseWithCaching = (response, next, url, maxAge) => (operation) => {
    const cachedItem = cache.get(url);
    if (cachedItem) {
        response.json(cachedItem.data);
        if (new Date().getTime() - cachedItem.fetchTimestamp > maxAge) {
            runOp(operation, url);
        }
    } else {
        runOp(operation, url, response, next);
    }
};

responseHandler.handleResponsePromise = (response, next) => operation => operation()
    .then(result => response.json(result),
        err => next(err))
    .done();

module.exports = responseHandler;
