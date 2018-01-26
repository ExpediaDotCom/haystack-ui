
/*

  *  Copyright 2018 Expedia, Inc.
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
const cache = require('./utils/cache');

const router = express.Router();

router.get('*', (req, res) => {
    res.render('index', {
        subsystems: Object.keys(config.stores),
        gaTrackingID: config.gaTrackingID,
        fieldKeys: config.stores.traces.fieldKeys,
        enableServicePerformance: config.enableServicePerformance,
        enableServiceLevelTrends: config.enableServiceLevelTrends,
        services: cache.get('/api/services') || null
    });
});

module.exports = router;
