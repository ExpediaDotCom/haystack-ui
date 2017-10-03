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

const Q = require('q');
const _ = require('lodash');

const store = {};

function getValue(min, max) {
    return _.round((Math.random() * (max - min)) + min, 0);
}

function getTimeStamp(addMin) {
    const currentTime = ((new Date()).getTime()) / 1000;
    return _.round(currentTime + (addMin * 60), 0);
}

function getRandomValues(timeWindow) {
    const valuesArr = [];
    _.range(10).forEach(i => valuesArr.push({values: getValue(10, 1000), timestamp: getTimeStamp(i * timeWindow)}));
    return valuesArr;
}

store.getTrends = () => Q.fcall(() =>
    [
        {
            operationName: 'stark-1',
            timeWindow: '5-min',
            summary: {
                totalSuccessCount: 80,
                totalFailureCount: 100,
                successPercent: getValue(10,100),
                avgDuration: 1200,
                tp95: 1000
            },
            rawValues: {
                count: getRandomValues(5),
                success: getRandomValues(5),
                failure: getRandomValues(5),
                duration: getRandomValues(5)
            }
        }
    ]
);

module.exports = store;
