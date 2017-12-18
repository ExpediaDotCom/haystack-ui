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
const handleResponsePromise = require('./utils/apiResponseHandler').handleResponsePromise;
const handleResponsePromiseWithCaching = require('./utils/apiResponseHandler').handleResponsePromiseWithCaching;

const traceStore = require(`../stores/traces/${config.stores.traces.storeName}/store`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();
const TRACE_CACHE_MAX_AGE = 60 * 1000;

router.get('/traces', (req, res, next) => {
    handleResponsePromise(res, next)(() => traceStore.findTraces(req.query));
});

router.get('/trace/:traceId', (req, res, next) => {
    handleResponsePromiseWithCaching(res, next, req.originalUrl, TRACE_CACHE_MAX_AGE)(() => traceStore.getTrace(req.params.traceId));
});

router.get('/trace/raw/:traceId/:spanId', (req, res, next) => {
    handleResponsePromiseWithCaching(res, next, req.originalUrl, TRACE_CACHE_MAX_AGE)(() => traceStore.getRawSpan(req.params.traceId, req.params.spanId));
});

router.get('/trace/raw/:traceId', (req, res, next) => {
    handleResponsePromiseWithCaching(res, next, req.originalUrl, TRACE_CACHE_MAX_AGE)(() => traceStore.getRawTrace(req.params.traceId));
});

module.exports = router;
