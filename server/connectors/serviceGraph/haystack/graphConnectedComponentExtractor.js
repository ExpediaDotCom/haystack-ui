/* eslint-disable no-param-reassign */
/*
 * Copyright 2017 Expedia, Inc.
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

const extractor = {};

function updatedDestination(graph, destination, source) {
    if (graph[destination]) {
        graph[destination].to = [...graph[destination].to, source];
    } else {
        graph[destination] = { to: [source] };
    }
}

function toUndirectedGraph(edges) {
    const graph = {};

    edges.forEach((edge) => {
        if (graph[edge.source]) {
            // add or update source
            graph[edge.source].to = [...graph[edge.source].to, edge.destination];

            // add or update destination
            // graph[edge.destination] = updatedDestination(graph[edge.destination], edge.source);
            updatedDestination(graph, edge.destination, edge.source);
        } else {
            // create edge at the source
            graph[edge.source] = { to: [edge.destination] };

            // add or update destination
            // graph[edge.destination] = updatedDestination(graph[edge.destination], edge.source);
            updatedDestination(graph, edge.destination, edge.source);
        }
    });

    return graph;
}

function doDepthFirstTraversal(graph, node) {
    const traversedNodes = [];
    const traversing = [];

    traversing.push(node);
    graph[node].isTraversing = true;

    while (traversing.length) {
        const nextNode = traversing.pop();
        traversedNodes.push(nextNode);
        graph[nextNode].isTraversed = true;

        graph[nextNode].to.forEach((to) => {
            if (!graph[to].isTraversing) {
                graph[to].isTraversing = true;
                traversing.push(to);
            }
        });
    }

    return traversedNodes;
}

function filterUntraversed(graph) {
    return Object.keys(graph).filter(node => !graph[node].isTraversed);
}

extractor.extractConnectedComponents = (edges) => {
    // converting to adjacency list undirected graph
    const graph = toUndirectedGraph(edges);

    // perform depth first graph traversals to get connected components list
    // until all the disjoint graps are traversed
    const connectedComponents = [];
    let untraversedNodes = filterUntraversed(graph);
    while (untraversedNodes.length) {
        connectedComponents.push(doDepthFirstTraversal(graph, untraversedNodes[0]));
        untraversedNodes = filterUntraversed(graph);
    }

    // return list of connected components
    return connectedComponents;
};

module.exports = extractor;
