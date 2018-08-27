
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

import {observable, action} from 'mobx';

export class SearchBarUiStateStore {
    @observable serviceName = null;
    @observable operationName = null;
    @observable fieldsKvString = null;
    @observable timeWindow = null;
    @observable chips = [];
    @observable displayErrors = {};

    @action init(search) {
        // initialize observables using search object
        this.setStateFromSearch(search);
    }

    getCurrentSearch() {
        // construct current search object using observables
        const search = {...this.chips};

        if (this.timeWindow.startTime && this.timeWindow.endTime) {
            search.time = {
                from: this.timeWindow.startTime,
                to: this.timeWindow.endTime
            };
        } else if (this.timeWindow.timePreset) {
            search.time = {
                preset: this.timeWindow.timePreset
            };
        }

        return search;
    }

    @action setStateFromSearch(search) {
        this.chips = [];
        Object.keys(search).forEach((key) => {
            if (key === 'time') {
                this.timeWindow = {startTime: search[key].from, endTime: search[key].to, timePreset: search[key].preset};
                // url query keys that we don't want as chips
            } else if (key !== 'tabId' && key !== 'type' && key !== 'useExpressionTree' && key !== 'spanLevelFilters') {
                this.chips[key] = search[key];
            }
        });
        this.serviceName = search.serviceName;
        this.operationName = search.operationName;
    }

    @action setTimeWindow(timeWindow) {
        this.timeWindow = timeWindow;
    }

    @action setFieldsUsingKvString(fieldsKvString) {
        this.fieldsKvString = fieldsKvString;
    }
}

export default new SearchBarUiStateStore();
