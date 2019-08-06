/*
 * Copyright 2019 Expedia Group
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

const Q = require('q');

const config = require('../../config/config');

const tracesConnector = require(`../../connectors/traces/${config.connectors.traces.connectorName}/tracesConnector`); // eslint-disable-line import/no-dynamic-require
const logger = require('../../utils/logger').withIdentifier('fetcher.serviceInsights');
const metrics = require('../../utils/metrics');

const fetcher = (fetcherName) => ({
    fetch(serviceName, from, to) {
        const deferred = Q.defer();
        const timer = metrics.timer(`fetcher_${fetcherName}`).start();

        const micro = (milli) => milli * 1000;
        const startTime = micro(from).toString();
        const endTime = micro(to).toString();
        tracesConnector
            .findTraces({
                useExpressionTree: 'true',
                serviceName,
                startTime,
                endTime,
                spanLevelFilters: '[]'
            })
            .then((traces) => {
                if (traces && traces.length > 0) {
                    tracesConnector.getRawTraces(JSON.stringify(traces.map((trace) => trace.traceId))).then((rawTraces) => {
                        timer.end();
                        logger.info(`fetch successful: ${fetcherName}`);
                        deferred.resolve({
                            serviceName,
                            spans: rawTraces
                        });
                    });
                } else {
                    logger.info(`fetch successful with no traces: ${fetcherName}`);
                    timer.end();
                    deferred.resolve({serviceName, spans: []});
                }
            });

        return deferred.promise;
    }
});

module.exports = fetcher;
