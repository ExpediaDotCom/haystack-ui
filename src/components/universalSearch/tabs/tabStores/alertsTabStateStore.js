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
import axios from 'axios';
import { fromPromise } from 'mobx-utils';
import {observable, action} from 'mobx';
import { ErrorHandlingStore } from '../../../../stores/errorHandlingStore';

export class AlertsTabStateStore extends ErrorHandlingStore {
    search = null;
    @observable isAvailable = false;
    @observable resultState = null;
    @observable result = [];

    @action init(search) {
        // initialize observables using search object
        // check if for the given search context tab should be available
        this.search = search;

        const keys =  Object.keys(search);
        this.isAvailable = (keys.length !== 1) && keys.every(key => key === 'serviceName' || key === 'operationName' ||  key === 'time');
    }

    @action fetch() {
        // trigger request using local search object
        // fetch should be called only after init on the state object
        this.resultState = fromPromise(
            axios
            .get(`${this.search.abcd}`)
            .then((result) => {
                this.result = result.data;
            })
            .catch((result) => {
                AlertsTabStateStore.handleError(result);
            })
        );
    }
}

export default new AlertsTabStateStore();
