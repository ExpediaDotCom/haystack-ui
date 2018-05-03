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

const connector = {};

const serviceGraph = {
    graphEdges: [
        {
            graphEdge: {
                source: 'stark-service',
                destination: 'baratheon-service',
                operation: 'baratheon-1'
            },
            edgeStats: {
                count: 29734,
                lastSeen: 1525368653926
            }
        },
        {
            graphEdge: {
                source: 'stark-service',
                destination: 'grayjoy-service',
                operation: 'grayjoy-1'
            },
            edgeStats: {
                count: 2000,
                lastSeen: 1525368653926
            }
        },
        {
            graphEdge: {
                source: 'baratheon-service',
                destination: 'lannister-service',
                operation: 'lannister-1'
            },
            edgeStats: {
                count: 29734,
                lastSeen: 1525368653926
            }
        },
        {
            graphEdge: {
                source: 'baratheon-service',
                destination: 'clegane-service',
                operation: 'clegane-1'
            },
            edgeStats: {
                count: 150,
                lastSeen: 1525368653926
            }
        },
        {
            graphEdge: {
                source: 'lannister-service',
                destination: 'tyrell-service',
                operation: 'tyrell-1'
            },
            edgeStats: {
                count: 238,
                lastSeen: 1525366748274
            }
        },
        {
            graphEdge: {
                source: 'tyrell-service',
                destination: 'targaryen-service',
                operation: 'targaryen-1'
            },
            edgeStats: {
                count: 33,
                lastSeen: 1525367895155
            }
        },
        {
            graphEdge: {
                source: 'tyrell-service',
                destination: 'tully-service',
                operation: 'tully-1'
            },
            edgeStats: {
                count: 51,
                lastSeen: 1525367895155
            }
        },
        {
            graphEdge: {
                source: 'targaryen-service',
                destination: 'dragon-service',
                operation: 'dragon-1'
            },
            edgeStats: {
                count: 19,
                lastSeen: 1525367774587
            }
        },
        {
            graphEdge: {
                source: 'targaryen-service',
                destination: 'drogo-service',
                operation: 'drogo-1'
            },
            edgeStats: {
                count: 25,
                lastSeen: 1525367774587
            }
        },
        {
            graphEdge: {
                source: 'targaryen-service',
                destination: 'mormont-service',
                operation: 'mormont-1'
            },
            edgeStats: {
                count: 25,
                lastSeen: 1525367774587
            }
        }
    ]
};

connector.getServiceGraph = () => Q.fcall(() => serviceGraph);

module.exports = connector;
