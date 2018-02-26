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

const StatsdClient = require('statsd-client');
const flatten = require('flat');
const metrics = require('./metrics');
const logger = require('./logger').withIdentifier('metrics');

const reporter = {};

reporter.start = (host, port, prefix, interval) => {
    const statsd = new StatsdClient({host, port, prefix});

    setInterval(() => {
        const flattenedMetrics = flatten(metrics.toJSON());

        // report to logs
        logger.info(prefix);
        logger.info(JSON.stringify(flattenedMetrics));

        // report to graphite
        Object.keys(flattenedMetrics).forEach((name) => {
            if (false) {
                statsd.gauge(name, flattenedMetrics[name]);
            }
        });
    }, interval);
};

module.exports = reporter;
