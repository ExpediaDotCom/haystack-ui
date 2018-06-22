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
const extractor = require('./graphConnectedComponentExtractor');
const _ = require('lodash');

const trendsFetcher = fetcher('serviceGraph');

const connector = {};
const serviceGraphUrl = config.connectors.serviceGraph.serviceGraphUrl;
const WINDOW_SIZE_IN_MILLIS = 3600;

function getEdgeName(vertex) {
    if (vertex.name) {
        return vertex.name;
    }
    return vertex;
}
function flattenStats(edges) {
    const serviceEdges = edges.map(edge => ({
        source: getEdgeName(edge.source), destination: getEdgeName(edge.destination), count: (edge.stats.count / WINDOW_SIZE_IN_MILLIS)
    }));
    return _.uniqWith(serviceEdges, _.isEqual);
}

function filterEdgesInComponent(component, edges) {
    const componentEdges = [];

    edges.forEach((edge) => {
        if (component.includes(edge.source) || component.includes(edge.destination)) {
            componentEdges.push(edge);
        }
    });

    return componentEdges;
}

function fetchServiceGraph() {
    const to = Date.now();
    const from = Date.now() - (WINDOW_SIZE_IN_MILLIS * 1000); // search for upto one hour old edges

    return trendsFetcher
        .fetch(`${serviceGraphUrl}?from=${from}&to=${to}`)
        .then((data) => {
            // convert servicegraph to expected ui data format
            const serviceToServiceEdges = flattenStats(data.edges);

            // get list of connected components in the full graph
            const connectedComponents = extractor.extractConnectedComponents(serviceToServiceEdges);

            // order components by service count
            const sortedConnectedComponents = connectedComponents.sort((a, b) => b.length - a.length);

            // split edges list by connected components
            // thus form multiple sub-graphs
            const graphs = [];
            sortedConnectedComponents.forEach(component => graphs.push(filterEdgesInComponent(component, serviceToServiceEdges)));

            // return graphs, one for each connected component
            return graphs;
    });
}

connector.getServiceGraph = () => Q.fcall(() => fetchServiceGraph());

module.exports = connector;
