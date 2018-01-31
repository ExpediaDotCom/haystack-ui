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

const indexToTimeframeConverter = [
    60 * 5,
    60 * 60,
    60 * 60 * 6,
    60 * 60 * 12,
    60 * 60 * 24,
    60 * 60 * 24 * 7
];

function AlertsException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class ServiceAlertsStore {
    @observable unhealthyAlertCount = null;
    @observable alerts = [];
    @observable promiseState = null;


    @action fetchUnhealthyAlertCount(serviceName) {
        axios
        .get(`/api/alerts/${serviceName}/unhealthyCount`)
        .then((result) => {
            this.unhealthyAlertCount = result.data;
        })
        .catch((result) => {
            throw new AlertsException(result);
        });
    }

    @action fetchServiceAlerts(serviceName, timeFrame) {
        const timeFrameString = timeFrame ? `timeFrame=${indexToTimeframeConverter[timeFrame]}` : `timeFrame=${60 * 60}`;
        this.promiseState = fromPromise(
            axios
            .get(`/api/alerts/${serviceName}?${timeFrameString}`)
            .then((result) => {
                this.alerts = result.data;
            })
            .catch((result) => {
                throw new AlertsException(result);
            })
        );
    }
}

export default new ServiceAlertsStore();
