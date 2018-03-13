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

const path = require('path');

const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');
const axios = require('axios');
const Q = require('q');
const os = require('os');
const passport = require('passport');

const config = require('./config/config');
const logger = require('./utils/logger');

const indexRoute = require('./routes/index');
const servicesApi = require('./routes/servicesApi');
const tracesApi = require('./routes/tracesApi');
const servicesPerfApi = require('./routes/servicesPerfApi');

const metricsMiddleware = require('./utils/metricsMiddleware');
const metricsReporter = require('./utils/metricsReporter');

const errorLogger = logger.withIdentifier('invocation:failure');

const app = express();

// CONFIGURATIONS
axios.defaults.timeout = config.upstreamTimeout;
Q.longStackSupport = true;
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('etag', false);
app.set('x-powered-by', false);

// MIDDLEWARE
app.use(compression());
app.use(favicon(`${__dirname}/../public/favicon.ico`));
app.use('/bundles', express.static(path.join(__dirname, '../public/bundles'), { maxAge: 0 }));
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '7d' }));
app.use(logger.REQUEST_LOGGER);
app.use(logger.ERROR_LOGGER);
app.use(metricsMiddleware.httpMetrics);
app.use(passport.initialize());
app.use(passport.session());

// ROUTING
const apis = [servicesApi, tracesApi, servicesPerfApi];
if (config.connectors.trends) apis.push(require('./routes/trendsApi')); // eslint-disable-line global-require
if (config.connectors.alerts) apis.push(require('./routes/alertsApi')); // eslint-disable-line global-require

app.use('/auth', require('./routes/auth')(config));
app.use('/sso', require('./routes/sso')(config));
app.use('/user', require('./routes/user')(config));

app.use('/api', ...apis);
app.use('/', indexRoute);

// ERROR-HANDLING
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    errorLogger.error(err);
    next(err);
});

// START METRICS REPORTING
metricsReporter.start(config.graphite.host, config.graphite.port, `haystack.ui.ui.${os.hostname()}`, 60000);

module.exports = app;
