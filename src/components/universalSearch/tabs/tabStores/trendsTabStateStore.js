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
import {observable, action} from 'mobx';
import { ErrorHandlingStore } from '../../../../stores/errorHandlingStore';
import operationStore from '../../../trends/stores/operationStore';

export class TrendsTabStateStore extends ErrorHandlingStore {
    search = null;
    @observable isAvailable = false;
    @observable resultState = null;
    @observable result = [];

    @action init(search) {
        // initialize observables using search object
        // check if for the given search context, tab is available
        this.search = search;

        const keys =  Object.keys(search);
        this.isAvailable = (keys.length !== 1) && Object.keys(search).every(key => key === 'serviceName' || key === 'operationName' ||  key === 'time');
    }

    @action fetch() {
        // TODO acting as a wrapper for older stores for now,
        // TODO fetch logic here
        operationStore.fetchStats(this.search.serviceName, {
            granularity: 5 * 60 * 1000,
            from: Date.now() - (60 * 60 * 1000),
            until: Date.now()
        }, true, null);
    }
}

export default new TrendsTabStateStore();
