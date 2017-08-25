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
// const store = require('./stubs/staticStore');
const store = require('./stubs/zipkinStore');

const router = express.Router();

router.get('/services', (req, res) => {
    store.getServices().then(results => res.json(results));
});

router.get('/traces', (req, res) => {
    store.findTraces(req.query).then(results => setTimeout(() => res.json(results), 1000));
});

router.get('/trace/:traceId', (req, res) => {
    store.getTrace(req.params.traceId).then(results => setTimeout(() => res.json(results), 1000));
});

module.exports = router;
