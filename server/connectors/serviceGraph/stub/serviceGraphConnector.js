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

const serviceGraph = [
    [
        {
            source: {
                name: 'stark-service'
            },
            destination: {
                name: 'baratheon-service'
            },
            operation: 'baratheon-1',
            stats: {
                count: 421,
                errorCount: 80
            }
        },
        {
            source: {
                name: 'stark-service'
            },
            destination: {
                name: 'grayjoy-service'
            },
            operation: 'grayjoy-1',
            stats: {
                count: 210,
                errorCount: 0
            }
        },
        {
            source: {
                name: 'baratheon-service'
            },
            destination: {
                name: 'lannister-service'
            },
            operation: 'lannister-1',
            stats: {
                count: 102,
                errorCount: 6
            }
        },
        {
            source: {
                name: 'baratheon-service'
            },
            destination: {
                name: 'clegane-service'
            },
            operation: 'clegane-1',
            stats: {
                count: 401,
                errorCount: 13
            }
        },
        {
            source: {
                name: 'lannister-service'
            },
            destination: {
                name: 'tyrell-service'
            },
            operation: 'tyrell-1',
            stats: {
                count: 30,
                errorCount: 2
            }
        },
        {
            source: {
                name: 'tyrell-service'
            },
            destination: {
                name: 'targaryen-service'
            },
            operation: 'targaryen-1',
            stats: {
                count: 50,
                errorCount: 3
            }
        },
        {
            source: {
                name: 'tyrell-service'
            },
            destination: {
                name: 'tully-service'
            },
            operation: 'tully-1',
            stats: {
                count: 121,
                errorCount: 1
            }
        },
        {
            source: {
                name: 'targaryen-service'
            },
            destination: {
                name: 'dragon-service'
            },
            operation: 'dragon-1',
            stats: {
                count: 190,
                errorCount: 80
            }
        },
        {
            source: {
                name: 'targaryen-service'
            },
            destination: {
                name: 'drogo-service'
            },
            operation: 'drogo-1',
            stats: {
                count: 98,
                errorCount: 2
            }
        },
        {
            source: {
                name: 'targaryen-service'
            },
            destination: {
                name: 'mormont-service'
            },
            operation: 'mormont-1',
            stats: {
                count: 5,
                errorCount: 0
            }
        }
    ]
];

connector.getServiceGraph = () => Q.fcall(() => serviceGraph);

module.exports = connector;
