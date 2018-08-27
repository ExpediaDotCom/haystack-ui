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

/* eslint-disable class-methods-use-this */

const enabled = window.haystackUiConfig && window.haystackUiConfig.enableServicePerformance;

export class ServicePerformanceStateStore {
    search = null;
    isAvailable = false;

    init(search) {
        // initialize observables using search object
        // check if for the given search context tab should be available
        this.search = search;

        // check all keys except time
        // eslint-disable-next-line no-unused-vars
        const {time, tabId, type, ...kv} =  search;
        const keys = Object.keys(kv);
        this.isAvailable = enabled && !keys.length;
    }

    fetch() {}
}

export default new ServicePerformanceStateStore();
