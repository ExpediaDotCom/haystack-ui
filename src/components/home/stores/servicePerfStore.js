/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */
import axios from 'axios';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';

function parseServicePerfResponse(servicePerfData) {
    const parsedServicePerfStats = [];
    servicePerfData.forEach((serviceStats) => {
        const serviceStatsObj = {
            serviceName: `${serviceStats.serviceName}`,
            successPercent: serviceStats.successPercent ? Math.exp(serviceStats.successPercent) : -100,
            failureCount: serviceStats.failureCount && Math.log(serviceStats.failureCount),
            totalCount: Math.log(serviceStats.totalCount)
        };
        parsedServicePerfStats.push(serviceStatsObj);
    });
    return parsedServicePerfStats;
}

export class ServicePerfStore {
    @observable servicePerfStats = {};
    @observable promiseState = { case: ({empty}) => empty() };

    @action fetchServicePerf(timeWindow, from, until) {
        this.promiseState = fromPromise(
            axios({
                method: 'get',
                url: `/api/servicePerf?timeWindow=${timeWindow}&from=${from}&until=${until}`
            })
                .then((response) => {
                    this.servicePerfStats = parseServicePerfResponse(response.data);
                })
        );
    }
}

export default new ServicePerfStore();
