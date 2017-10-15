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


const presets = {};

presets.presets = [
    {
        id: '5m',
        shortName: '5m',
        longName: '5 minutes',
        value: 5 * 60 * 1000 * 1000
    },
    {
        id: '1h',
        shortName: '1h',
        longName: '1 hour',
        value: 60 * 60 * 1000 * 1000
    },
    {
        id: '6h',
        shortName: '6h',
        longName: '6 hours',
        value: 6 * 60 * 60 * 1000 * 1000
    },
    {
        id: '12h',
        shortName: '12h',
        longName: '12 hours',
        value: 12 * 60 * 60 * 1000 * 1000
    },
    {
        id: '24h',
        shortName: '24h',
        longName: '24 hours',
        value: 24 * 60 * 60 * 1000 * 1000
    },
    {
        id: '24h',
        shortName: '24h',
        longName: '24 hours',
        value: 7 * 24 * 60 * 60 * 1000 * 1000
    }
];

export default presets;
