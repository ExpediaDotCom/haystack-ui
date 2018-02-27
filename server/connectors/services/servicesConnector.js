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
const _ = require('lodash');
const Q = require('q');
const cache = require('../../routes/utils/cache');
const config = require('../../config/config');
const logger = require('../../utils/logger').withIdentifier('servicesConnector');

const tracesConnector = require(`../traces/${config.connectors.traces.connectorName}/tracesConnector`); // eslint-disable-line import/no-dynamic-require

const connector = {};

function fetchAndSet(cacheKey, op, maxAge) {
    const cachedItem = cache.get(cacheKey);

    if (cachedItem) {
        const isExpired = !cache.get(cacheKey);

        // check if the last cache.get entry was stale and hence expired
        if (isExpired) {
            // set the cache key again so that next cache call doesn't force to make a downstream call
            // but make a async refresh for the given key.
            cache.set(cacheKey, cachedItem, maxAge);
            logger.info(`cache expired for ${cacheKey}`);

            op()
            .then((result) => {
                if (!_.isEmpty(result)) {
                    cache.set(cacheKey, result, maxAge);
                }
            });
        }
        return Q.fcall(() => cachedItem);
    }

    logger.info(`cache missed for ${cacheKey}`);
    return op()
    .then((result) => {
        if (!_.isEmpty(result)) {
            cache.set(cacheKey, result, maxAge);
        }

        return result;
    });
}

connector.getServicesSync = () => cache.get('services');

connector.getServices = () => fetchAndSet('services', () => tracesConnector.getServices(), 5 * 60 * 1000);

connector.getOperations = serviceName => fetchAndSet(`operations-${serviceName}`, () => tracesConnector.getOperations(serviceName), 5 * 60 * 1000);

module.exports = connector;
