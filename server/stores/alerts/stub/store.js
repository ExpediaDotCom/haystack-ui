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


function getValue(min, max) {
    return _.round((Math.random() * (max - min)) + min, 0);
}

function getRandomTimeStamp() {
    const currentTime = ((new Date()).getTime()) * 1000;
    return (currentTime - Math.floor((Math.random() * 5000 * 60 * 1000)));
}

function getRandomValues() {
    const valuesArr = [];
    _.range(50).forEach(() => valuesArr.push({value: getValue(1000, 10000000), timestamp: getRandomTimeStamp()}));
    return valuesArr;
}

const alerts = [
    {
        alertId: 1,
        operationName: 'tarley-1',
        type: 1,
        status: false,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 2,
        operationName: 'tarley-1',
        type: 2,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 3,
        operationName: 'tarley-1',
        type: 3,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 4,
        operationName: 'tully-1',
        type: 1,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 5,
        operationName: 'tully-1',
        type: 2,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 6,
        operationName: 'tully-1',
        type: 3,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 7,
        operationName: 'dondarrion-1',
        type: 1,
        status: false,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 8,
        operationName: 'dondarrion-1',
        type: 2,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 9,
        operationName: 'dondarrion-1',
        type: 3,
        status: false,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    }
];

const alertDetails = {
    subscriptions: [
        {
            subscriptionId: '1',
            type: 'Slack',
            days: [0, 1, 2, 3, 4, 5, 6],
            time: ['0000', '2359'],
            enabled: true
        },
        {
            subscriptionId: '2',
            type: 'Email',
            days: [0, 1, 2, 3, 4, 5, 6],
            time: ['0000', '2359'],
            enabled: true
        }
    ],
    history: [
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: true,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: true,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: true,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: true,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: true,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        }
    ]
};

const store = {};

store.getServiceAlerts = () => Q.fcall(() => alerts);

store.getAlertDetails = () => Q.fcall(() => alertDetails);


module.exports = store;
