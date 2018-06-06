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
import timeWindow from '../../../utils/timeWindow';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';

import { ErrorHandlingStore } from '../../../stores/errorHandlingStore';

export class ServiceAlertsStore extends ErrorHandlingStore {
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
            ServiceAlertsStore.handleError(result);
        });
    }

    @action fetchServiceAlerts(serviceName, granularity, preset) {
        const timeRange = timeWindow.toTimeRange(preset.value);
        const timeFrameString = `granularity=${granularity}&from=${timeRange.from}&until=${timeRange.until}`;
        this.promiseState = fromPromise(
            axios
            .get(`/api/alerts/${serviceName}?${timeFrameString}`)
            .then((result) => {
                this.alerts = result.data;
            })
            .catch((result) => {
                ServiceAlertsStore.handleError(result);
            })
        );
    }
}

export default new ServiceAlertsStore();
