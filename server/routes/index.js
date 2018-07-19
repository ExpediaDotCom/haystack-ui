
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
const onFinished = require('finished');
const config = require('../config/config');
const servicesConnector = require('../connectors/services/servicesConnector');
const metrics = require('../utils/metrics');
const assets = require('../../public/assets.json');

const router = express.Router();

router.get('*', (req, res) => {
    const timer = metrics.timer('index').start();

    res.render('index', {
        bundleAppJsPath: assets.app.js,
        bundleAppCssPath: assets.app.css,
        bundleCommonsJsPath: assets.commons.js,
        subsystems: Object.keys(config.connectors),
        gaTrackingID: config.gaTrackingID,
        usbPrimary: config.usbPrimary,
        enableServicePerformance: config.enableServicePerformance,
        enableServiceLevelTrends: config.enableServiceLevelTrends,
        services: servicesConnector.getServicesSync(),
        enableSSO: config.enableSSO,
        refreshInterval: config.refreshInterval,
        enableAlertSubscriptions: config.connectors.alerts && config.connectors.alerts.subscriptions.enabled,
        tracesTimePresetOptions: config.connectors.traces.timePresetOptions,
        timeWindowPresetOptions: config.timeWindowPresetOptions,
        tracesTTL: config.connectors.traces.ttl,
        trendsTTL: config.connectors.trends.ttl
    });

    onFinished(res, () => {
        timer.end();
    });
});

module.exports = router;
