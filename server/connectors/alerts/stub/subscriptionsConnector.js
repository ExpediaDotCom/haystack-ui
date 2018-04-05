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

function getAlertSubscriptions(serviceName, operationName, alertType) {
    if (serviceName && operationName && alertType) {
        return subscriptions;
    }
    throw new Error('Unable to get subscriptions');
}

function addAlertSubscription(serviceName, operationName, alertType, dispatcherType, dispatcherId) {
    if (serviceName && operationName && alertType && dispatcherType && dispatcherId) {
        return 'New subscription created';
    }
    throw new Error('Unable to add subscription');
}

function updateAlertSubscription(subscriptionId, dispatcherId) {
    if (subscriptionId && dispatcherId) {
        return 'Subscription updated';
    }
    throw new Error('Unable to update subscription');
}

const connector = {};

connector.getAlertSubscriptions = (serviceName, operationName, alertType) => Q.fcall(() => getAlertSubscriptions(serviceName, operationName, alertType));

connector.addAlertSubscription = (serviceName, operationName, alertType, dispatcherType, dispatcherId) => Q.fcall(() => addAlertSubscription(
    serviceName,
    operationName,
    alertType,
    dispatcherType,    // smtp / slack
    dispatcherId)      // emailId / slackId
);

connector.updateAlertSubscription = (subscriptionId, dispatcherId) => Q.fcall(() => updateAlertSubscription(subscriptionId, dispatcherId));

module.exports = connector;
