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
import axios from 'axios';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';

function AlertsException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class AlertDetailsStore {
    @observable alertHistory = [];
    @observable alertSubscriptions = [];
    @observable historyPromiseState = null;
    @observable subscriptionsPromiseState = null;


    @action fetchAlertHistory(serviceName, operationName, type) {
        this.historyPromiseState = fromPromise(
            axios
                .get(`/api/alert/${serviceName}/${operationName}/${type}/history`)
                .then((result) => {
                    this.alertHistory = result.data;
                })
                .catch((result) => {
                    throw new AlertsException(result);
                })
        );
    }

    @action fetchAlertSubscriptions(serviceName, operationName, type) {
        this.subscriptionsPromiseState = fromPromise(
            axios
                .get(`/api/alert/${serviceName}/${operationName}/${type}/subscriptions`)
                .then((result) => {
                    this.alertSubscriptions = result.data;
                })
                .catch((result) => {
                    throw new AlertsException(result);
                })
        );
    }

    @action addNewSubscription(serviceName, operationName, type, dispatcherType, dispatcherId) {
        this.subscriptionsPromiseState = fromPromise(
            axios
                .post(`/api/alert/${serviceName}/${operationName}/${type}/subscriptions`, {dispatcherType, dispatcherId})
                .then(() => {})
                .catch((result) => {
                    throw new AlertsException(result);
                })
        );
    }

    @action updateSubscription(serviceName, operationName, type, dispatcherType, dispatcherId) {
        this.subscriptionsPromiseState = fromPromise(
            axios
                .put(`/api/alert/${serviceName}/${operationName}/${type}/subscriptions`, {dispatcherType, dispatcherId})
                .then(() => {})
                .catch((result) => {
                    throw new AlertsException(result);
                })
        );
    }
}

export default new AlertDetailsStore();
