/*
 * Copyright 2018 Expedia, Inc.
 *
 *         Licensed under the Apache License, Version 2.0 (the 'License');
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an 'AS IS' BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

const Q = require('q');

const fetcher = require('../../operations/restFetcher');
const config = require('../../../config/config');
const extractor = require('./graphDataExtractor');

const trendsFetcher = fetcher('serviceGraph');

const connector = {};
const serviceGraphUrl = config.connectors.serviceGraph.serviceGraphUrl;
const WINDOW_SIZE_IN_SECS = config.connectors.serviceGraph.windowSizeInSecs;

function fetchServiceGraph(from, to) {
    return trendsFetcher
        .fetch(`${serviceGraphUrl}?from=${from}&to=${to}`)
        .then(data => extractor.extractGraphs(data));
}

connector.getServiceGraph = () => Q.fcall(() => fetchServiceGraph(Date.now() - (WINDOW_SIZE_IN_SECS * 1000), Date.now()));
connector.getServiceGraphForTimeLine = (from, to) => Q.fcall(() => fetchServiceGraph(from, to));

module.exports = connector;
