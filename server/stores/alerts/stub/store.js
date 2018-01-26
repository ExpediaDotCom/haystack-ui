/*
 * Copyright 2018 Expedia, Inc.
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


function getValue(min, max) {
    return _.round((Math.random() * (max - min)) + min, 0);
}

function getRandomTimeStamp() {
    const currentTime = ((new Date()).getTime()) * 1000;
    return (currentTime - Math.floor((Math.random() * 5000 * 60 * 1000)));
}

function getAlertHistoryTimestamps() {
    const currentTime = ((new Date()).getTime()) * 1000;
    const end = (currentTime - Math.floor((Math.random() * 2000000 * 60 * 1000)));
    const start = end - Math.floor((Math.random() * 5000 * 60 * 1000));
    return {
        startTimestamp: start,
        endTimestamp: end
    };
}

function getRandomValues() {
    const valuesArr = [];
    _.range(50).forEach(() => valuesArr.push({value: getValue(1000, 10000000), timestamp: getRandomTimeStamp()}));
    return valuesArr;
}

const alerts = [
    {
        operationName: 'tarley-1',
        type: 'count',
        isUnhealthy: false,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'tarley-1',
        type: 'durationTp99',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'tarley-1',
        type: 'successPercentage',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'tully-1',
        type: 'count',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'tully-1',
        type: 'durationTp99',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'tully-1',
        type: 'successPercentage',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'dondarrion-1',
        type: 'count',
        isUnhealthy: false,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'dondarrion-1',
        type: 'durationTp99',
        isUnhealthy: true,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    },
    {
        operationName: 'dondarrion-1',
        type: 'successPercentage',
        isUnhealthy: false,
        timestamp: getRandomTimeStamp(),
        trend: getRandomValues()
    }
];

const alertDetails = [
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps()
];

const store = {};

store.getServiceAlerts = () => Q.fcall(() => alerts);

store.getAlertDetails = () => Q.fcall(() => alertDetails);


module.exports = store;
