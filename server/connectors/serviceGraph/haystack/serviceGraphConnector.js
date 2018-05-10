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

// constant to define how old edges are allowed in the graph
const FRESHNESS_WINDOW = 24 * 60 * 60 * 1000;

function removeStaleEdges(edges) {
    const threshold = Date.now() - FRESHNESS_WINDOW;
    return edges.filter(e => e.stats.lastSeen > threshold);
}

function convertToServiceToServiceEdges(edges) {
    const serviceEdges = edges.map(edge => ({ source: edge.source, destination: edge.destination}));

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
    return trendsFetcher
        .fetch(serviceGraphUrl)
        .then((data) => {
            // filter stale edges
            // rejecting edges lastSeen before a certain time window
            const filteredEdges = removeStaleEdges(data.edges);

            // convert service -- operation --> service edges to service --> service edges
            // TODO: remove once api has endpoint for getting service to service edges
            const serviceToServiceEdges = convertToServiceToServiceEdges(filteredEdges);

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
