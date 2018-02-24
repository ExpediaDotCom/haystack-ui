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

const trendStore = require(`../stores/trends/${config.stores.trends.storeName}/store`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();
const SERVICE_CACHE_MAX_AGE = 60 * 1000;

router.get('/servicePerf', (req, res, next) => {
    const {
        granularity,
        from,
        until
    } = req.query;
    handleResponsePromiseWithCaching(res, next, req.originalUrl, SERVICE_CACHE_MAX_AGE, 'servicePerf')(
        () => trendStore.getServicePerfStats(granularity, from, until)
    );
});

module.exports = router;
