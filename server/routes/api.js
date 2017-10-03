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

const traceStore = require(`../stores/traces/${config.traces.store}/store`); // eslint-disable-line import/no-dynamic-require
const trendStore = require(`../stores/trends/${config.trends.store}/store`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();

router.get('/services', (req, res) => {
    traceStore.getServices().then(results => res.json(results));
});

router.get('/operations', (req, res) => {
    traceStore.getOperations(req.query.serviceName).then(results => res.json(results));
});

router.get('/traces', (req, res) => {
    traceStore.findTraces(req.query).then(results => res.json(results));
});

router.get('/trace/:traceId', (req, res) => {
    traceStore.getTrace(req.params.traceId).then(results => res.json(results));
});

router.get('/trends', (req, res) => {
    trendStore.getTrends(req.query.serviceName).then(results => res.json(results));
});

module.exports = router;
