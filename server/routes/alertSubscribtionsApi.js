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

const express = require('express');
const config = require('../config/config');
const handleResponsePromise = require('./utils/apiResponseHandler').handleResponsePromise;

const subscriptionsConnector = require(`../connectors/alerts/${config.connectors.alerts.subscriptions.connectorName}/subscriptionsConnector`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();

router.get('/subscriptions/:serviceName/:operationName/:alertType', (req, res, next) => {
    handleResponsePromise(res, next, 'subscriptions_SVC_OP_TYPE')(
    () => subscriptionsConnector.getSubscriptions(
        req.params.serviceName,
        req.params.operationName,
        req.params.alertType)
    )
    ;
});

router.post('/addsubscription', (req, res, next) => {
    handleResponsePromise(res, next, 'addsubscriptions_SVC_OP_TYPE')(
    () => subscriptionsConnector.addSubscription(
            req.body.serviceName,
            req.body.operationName,
            req.body.alertType,
            req.body.dispatcherType,    // smtp / slack
            req.body.dispatcherId)      // emailId / slackId
    );
});

router.put('/updatesubscription/:subscriptionId', (req, res, next) => {
    handleResponsePromise(res, next, 'updatesubscriptions_SVC_OP_TYPE')(
        () => subscriptionsConnector.updateSubscription(
            req.params.subscriptionId,
            req.body.dispatcherId)      // emailId or slackId
    );
});

module.exports = router;
