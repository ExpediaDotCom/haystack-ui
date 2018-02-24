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

const express = require('express');
const config = require('../config/config');
const handleResponsePromiseWithCaching = require('./utils/apiResponseHandler').handleResponsePromiseWithCaching;

const traceStore = require(`../connectors/traces/${config.connectors.traces.storeName}/store`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();
const SERVICE_CACHE_MAX_AGE = 5 * 60 * 1000;

router.get('/services', (req, res, next) => {
    handleResponsePromiseWithCaching(res, next, req.originalUrl, SERVICE_CACHE_MAX_AGE, 'services')(
        () => traceStore.getServices()
    );
});

router.get('/operations', (req, res, next) => {
    handleResponsePromiseWithCaching(res, next, req.originalUrl, SERVICE_CACHE_MAX_AGE, 'operations')(
        () => traceStore.getOperations(req.query.serviceName)
    );
});

module.exports = router;
