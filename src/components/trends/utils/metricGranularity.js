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


const granularity = {};

granularity.presets = [
    {
        id: '1m',
        shortName: '1m',
        value: 60 * 1000 * 1000
    },
    {
        id: '5m',
        shortName: '5m',
        value: 5 * 60 * 1000 * 1000
    },
    {
        id: '15m',
        shortName: '15m',
        value: 15 * 60 * 1000 * 1000
    },
    {
        id: '1h',
        shortName: '1h',
        value: 60 * 60 * 1000 * 1000
    }
];

export default granularity;
