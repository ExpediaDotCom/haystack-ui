/*
 * Copyright 2018 Expedia Group
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

const grpc = require('grpc');
const messages = require('../../../../static_codegen/subscription/subscriptionManagement_pb');
const expressionTreeBuilder = require('./expressionTreeBuilder');
const config = require('../../../config/config');
const services = require('../../../../static_codegen/subscription/subscriptionManagement_grpc_pb');
const fetcher = require('../../operations/grpcFetcher');
const putter = require('../../operations/grpcPutter');
const deleter = require('../../operations/grpcDeleter');
const poster = require('../../operations/grpcPoster');

const grpcOptions = {
    'grpc.max_receive_message_length': 10485760, // todo: do I need these?
    ...config.connectors.traces.grpcOptions
};


const client = new services.SubscriptionManagementClient(
    `${config.connectors.alerts.subscriptions.haystackHost}:${config.connectors.alerts.subscriptions.haystackPort}`,
    grpc.credentials.createInsecure(),
    grpcOptions); // TODO make client secure

const subscriptionPoster = poster('createSubscription', client);
const subscriptionPutter = putter('updateSubscription', client);
const subscriptionDeleter = deleter('deleteSubscription', client);
const getSubscriptionFetcher = fetcher('getSubscription', client); // get individual subscription
const searchSubscriptionFetcher = fetcher('searchSubscription', client); // get group of subscriptions

const connector = {};

const converter = {};

converter.toSubscriptionJson = pbSub => ({
    subscriptionId: pbSub.subscriptionid,
    user: pbSub.user,
    dispatchersList: pbSub.dispatchersList,
    expressionTree: pbSub.expressiontree,
    lastModifiedTime: pbSub.lastmodifiedtime,
    createdTime: pbSub.createdtime
});

// Get subscription from subscriptionId. Returns SubscriptionResponse.
connector.getPBSubscription = (subscriptionId) => {
    const request = new messages.GetSubscriptionRequest();
    request.setSubscriptionid(subscriptionId);

    return getSubscriptionFetcher
        .fetch(request)
        .then(result => converter.toSubscriptionJson(messages.SubscriptionResponse.toObject(false, result)));
};

// Get subscription from subscriptionId. Returns JSON Subscription.
connector.getSubscription = (subscriptionId) => {
    const pbSub = connector.getPBSubscription(subscriptionId);
    return converter.toSubscriptionJson(messages.SubscriptionResponse.toObject(false, pbSub));
};

// Search subscriptions given a set of labels. Returns a SearchSubscriptionResponse (array of SubscriptionResponses).
connector.searchSubscriptions = (serviceName, operationName, type) => {
    const request = new messages.SearchSubscriptionRequest();
    request.getLabelsMap().set('serviceName', serviceName).set('operationName', operationName).set('type', type);

    return searchSubscriptionFetcher
        .fetch(request)
        .then(result => result.map(pbSubResponse => converter.toSubscriptionJson(messages.SubscriptionResponse.toObject(false, pbSubResponse))));
};

// Create a new subscription. Returns a subscription id.
connector.addSubscription = (username, subscriptionObj) => {
    const user = new messages.User();
    user.setUsername(username);

    const subscription = new messages.SubscriptionRequest();

    // construct dispatcher list containing type (email or slack) and handle
    const dispatchers = subscriptionObj.dispatchers;
    Object.keys(dispatchers).map((inputtedDispatcher) => {
        const dispatcher = new messages.Dispatcher();

        dispatcher.setType(inputtedDispatcher.type);
        dispatcher.setValue(inputtedDispatcher.value);
        return dispatcher;
    });
    subscription.setDispatchersList(dispatchers);

    // construct expression tree from KV pairs in subscription object (e.g. serviceName, operationName, etc)
    const expressionTree = expressionTreeBuilder.createSubscriptionExpressionTree(subscriptionObj);
    subscription.setExpressiontree(expressionTree);

    const request = new messages.CreateSubscriptionRequest();
    request.setUser(user);
    request.setSubscriptionrequest(subscription);

    return subscriptionPoster.post(request)
        .then(result => result);
};


// Update an expression tree, returns SubscriptionRequest
function updateExpressionTree(clientSubscription, serverSubscription) {
    const serverDispatchers = serverSubscription.getDispatchersList();
    const newExpressionTree = expressionTreeBuilder.createSubscriptionExpressionTree(clientSubscription);

    const subscription = messages.SubscriptionRequest();
    subscription.setExpressiontree(newExpressionTree);
    subscription.setDispatchersList(serverDispatchers);
    return subscription;
}

// Adds a dispatcher to an existing subscription, returns SubscriptionRequest
function addDispatcher(subscription, serverDispatchers, clientSubscription) {
    subscription.setDispatchersList(serverDispatchers);

    const dispatcherToAdd = clientSubscription.modifiedDispatcher;
    const newDispatcher = new messages.Dispatcher();
    newDispatcher.setType(dispatcherToAdd.type);
    newDispatcher.setValue(dispatcherToAdd.value);
    subscription.addDispatchers(newDispatcher);
    return subscription;
}

// Delete dispatcher from existing subscription, returns SubscriptionRequest
function deleteDispatcher(clientSubscription, serverDispatchers, subscription) {
    const dispatcherToDelete = clientSubscription.modifiedDispatcher;
    serverDispatchers.forEach((dispatcher) => {
        if (dispatcher.type !== dispatcherToDelete.type && dispatcher.value !== dispatcherToDelete.value) {
            subscription.addDispatchers(dispatcher);
        }
    });
    return subscription;
}

// Edit the type and/or value of an existing dispatcher in an existing subscription, returns SubscriptionRequest
function modifyDispatcher(clientSubscription, serverDispatchers, subscription) {
    const dispatcherBeforeModification = clientSubscription.modifiedDispatcher.old;
    const modifiedDispatcher = clientSubscription.modifiedDispatcher.new;
    serverDispatchers.forEach((dispatcher) => {
        if (dispatcher.type !== dispatcherBeforeModification.type && dispatcher.value !== dispatcherBeforeModification.value) {
            subscription.addDispatchers(dispatcher);
        } else {
            const newDispatcher = new messages.Dispatcher();
            newDispatcher.setType(modifiedDispatcher.type);
            newDispatcher.setValue(modifiedDispatcher.value);

            subscription.addDispatchers(newDispatcher);
        }
    });
    return subscription;
}

// Put call for above subscription modification methods, returns empty.
connector.updateSubscription = (id, clientSubscription, updateAction) => {
    const serverSubscription = connector.getPBSubscription(id);
    let subscription;
    if (updateAction === 'updateExpressionTree') {
        subscription = updateExpressionTree(clientSubscription, serverSubscription);
    } else {
        subscription = messages.SubscriptionRequest();
        const serverExpression = serverSubscription.getExpressiontree();
        const serverDispatchers = serverSubscription.getDispatchersList();
        subscription.setExpressiontree(serverExpression);

        switch (updateAction) {
            case 'addDispatcher':
                subscription = addDispatcher(subscription, serverDispatchers, clientSubscription);
                break;
            case 'deleteDispatcher':
                subscription = deleteDispatcher(clientSubscription, serverDispatchers, subscription);
                break;
            case 'modifyDispatcher':
                subscription = modifyDispatcher(clientSubscription, serverDispatchers, subscription);
                break;
            default:
                return null;
        }
    }

    const request = new messages.UpdateSubscriptionRequest();
    request.setSubscriptionid(id);
    request.setSubscriptionrequest(subscription);
    return subscriptionPutter.put(request)
        .then(() => {});
};

// Delete a subscription. Returns empty.
connector.deleteAlertSubscription = (id) => {
    const request = new messages.DeleteSubscriptionRequest();
    request.setSubscriptionid(id);

    return subscriptionDeleter.delete(request)
        .then(() => {});
};

module.exports = connector;
