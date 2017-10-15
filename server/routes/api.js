/*
 *  Copyright 2017 Expedia, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

const express = require('express');
const config = require('../config/config');

const traceStore = require(`../stores/traces/${config.stores.traces.storeName}/store`); // eslint-disable-line import/no-dynamic-require
const trendStore = config.stores.trends ? require(`../stores/trends/${config.stores.trends.storeName}/store`) : require('../stores/trends/noOp/store'); // eslint-disable-line import/no-dynamic-require

const router = express.Router();

function handleResponsePromise(response, next) {
    return operation => operation().then(
        result => response.json(result),
        err => next(err)
    ).done();
}

router.get('/services', (req, res, next) => {
    handleResponsePromise(res, next)(() => traceStore.getServices());
});

router.get('/operations', (req, res, next) => {
    handleResponsePromise(res, next)(() => traceStore.getOperations(req.query.serviceName));
});

router.get('/traces', (req, res, next) => {
    handleResponsePromise(res, next)(() => traceStore.findTraces(req.query));
});

router.get('/trace/:traceId', (req, res, next) => {
    handleResponsePromise(res, next)(() => traceStore.getTrace(req.params.traceId));
});

router.get('/trends', (req, res, next) => {
    const {
        serviceName,
        timespan,
        from,
        until
    } = req.query;
    handleResponsePromise(res, next)(() => trendStore.getTrends(serviceName, timespan, from, until));
});

module.exports = router;
