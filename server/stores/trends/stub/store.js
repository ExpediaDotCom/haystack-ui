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
    const currentTime = ((new Date()).getTime());
    return (currentTime + (addMin * 10000)) * 1000;
}

function getRandomValues(timeWindow, dataPoints) {
    const valuesArr = [];
    _.range(dataPoints).forEach(i => valuesArr.push({value: getValue(10, 1000), timestamp: getTimeStamp(i * timeWindow)}));
    return valuesArr;
}

function getRandomValuesWithRandomTime(timeWindow, dataPoints) {
    const valuesArr = [];
    _.range(dataPoints).forEach(i => valuesArr.push({value: getValue(10, 1000), timestamp: getTimeStamp(i * (timeWindow + Math.random()))}));
    return valuesArr;
}

store.getTrends = () => Q.fcall(() =>
    [
        {
            operationName: 'seaworth-1',
            summary: {
                count: 10000,
                successCount: 8000,
                failureCount: 1000,
                successPercent: getValue(10, 100),
                meanDuration: 2,
                tp95: 900,
                tp99: 950
            },
            rawValues: {
                count: getRandomValues(5, 60),
                successCount: getRandomValues(5, 50),
                failureCount: getRandomValues(5, 50),
                meanDuration: getRandomValues(5, 50),
                tp95: getRandomValues(5, 60),
                tp99: getRandomValues(5, 60)
            }
        },
        {
            operationName: 'bolton-1',
            summary: {
                count: 15000,
                successCount: 12000,
                failureCount: 3000,
                successPercent: getValue(10, 100),
                meanDuration: 53,
                tp95: 900,
                tp99: 950
            },
            rawValues: {
                count: getRandomValues(120, 10),
                successCount: getRandomValues(120, 30),
                failureCount: getRandomValues(120, 30),
                meanDuration: getRandomValues(120, 30),
                tp95: getRandomValues(50, 30),
                tp99: getRandomValues(50, 30)
            }
        },
        {
            operationName: 'baelish-1',
            summary: {
                count: 5000,
                successCount: 4000,
                failureCount: 1000,
                successPercent: getValue(10, 100),
                meanDuration: 11,
                tp95: 900,
                tp99: 950
            },
            rawValues: {
                count: getRandomValues(5, 10),
                successCount: getRandomValues(5, 10),
                failureCount: getRandomValues(5, 10),
                meanDuration: getRandomValues(5, 10),
                tp95: getRandomValues(5, 10),
                tp99: getRandomValues(5, 10)
            }
        },
        {
            operationName: 'mormont-1',
            summary: {
                count: 1000,
                successCount: 800,
                failureCount: 200,
                successPercent: getValue(10, 100),
                meanDuration: 121,
                tp95: 900,
                tp99: 950
            },
            rawValues: {
                count: getRandomValuesWithRandomTime(5, 10),
                successCount: getRandomValuesWithRandomTime(5, 10),
                failureCount: getRandomValuesWithRandomTime(5, 10),
                meanDuration: getRandomValuesWithRandomTime(5, 10),
                tp95: getRandomValuesWithRandomTime(5, 10),
                tp99: getRandomValuesWithRandomTime(5, 10)
            }
        }
    ]
);

module.exports = store;
