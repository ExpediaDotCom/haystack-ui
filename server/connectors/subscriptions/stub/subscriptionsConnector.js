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

const subscriptions =
    [
        {
            subscriptionId: 101,
            dispatcherType: 'slack',
            dispatcherIds: [
                '#stub-haystackanomalychecks'
            ]
        },
        {
            subscriptionId: 102,
            dispatcherType: 'smtp',
            dispatcherIds: [
                'stub-haystack@expedia.com'
            ]
        }
    ];

function getSubscriptions(serviceName, operationName, alertType) {
    if (serviceName && operationName && alertType) {
        return subscriptions;
    }
    return [];
}

function addSubscription(serviceName, operationName, alertType, dispatcherType, dispatcherId, res) {
    if (serviceName && operationName && alertType && dispatcherType && dispatcherId) {
        return res.status(200).send('New subscription created');
    }
    return res.status(500).send({
        err: 'Failed to add subscription'
    });
}

function updateSubscription(subscriptionId, dispatcherId, res) {
    if (subscriptionId && dispatcherId) {
        return res.status(200).send('Subscription updated');
    }
    return [];
}

const connector = {};

connector.getSubscriptions = (serviceName, operationName, alertType) => Q.fcall(() => getSubscriptions(serviceName, operationName, alertType));

connector.addSubscription = (serviceName, operationName, alertType, dispatcherType, dispatcherId, res) => Q.fcall(() => addSubscription(
    serviceName,
    operationName,
    alertType,
    dispatcherType,    // smtp / slack
    dispatcherId,      // emailId / slackId
    res)
);

connector.updateSubscription = (subscriptionId, dispatcherId, res) => Q.fcall(() => updateSubscription(subscriptionId, dispatcherId, res));

module.exports = connector;
