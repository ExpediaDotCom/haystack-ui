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
import { action } from 'mobx';
import { ErrorHandlingStore } from '../../../../stores/errorHandlingStore';
import tracesSearchStore from '../../../traces/stores/tracesSearchStore';

export class TracesTabStateStore extends ErrorHandlingStore {
    search = null;
    isAvailable = false;

    @action init(search) {
        // initialize observables using search object
        // check if for the given search context, tab is available
        this.search = search;
        this.isAvailable = !(Object.keys(search).length === 1); // the only key in search is time
    }

    @action fetch() {
        // TODO acting as a wrapper for older stores for now,
        // TODO fetch logic here
        tracesSearchStore.fetchSearchResults(
            {
                serviceName: this.search.serviceName,
                timePreset: this.search.time.preset
            });
    }
}

export default new TracesTabStateStore();
