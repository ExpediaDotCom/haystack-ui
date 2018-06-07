
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

import {observable, action} from 'mobx';
import {toFieldsKvString, extractSecondaryFields} from '../../traces/utils/traceQueryParser';

export class SearchBarUiStateStore {
    @observable serviceName = null;
    @observable operationName = null;
    @observable fieldsKvString = null;
    @observable timeWindow = null;
    @observable chips = [];
    @observable displayErrors = {};

    @action setServiceName(serviceName) {
        this.serviceName = serviceName;
    }

    @action setOperationName(operationName) {
        this.operationName = operationName;
    }

    @action setChips(chips) {
        this.chips = chips;
    }

    @action setTimeWindow(timeWindow) {
        this.timeWindow = timeWindow;
    }

    @action setFieldsUsingKvString(fieldsKvString) {
        this.fieldsKvString = fieldsKvString;
    }

    @action setDisplayErrors(displayErrors) {
        this.displayErrors = displayErrors;
    }

    @action initUsingQuery(query) {
        this.displayErrors = {};

        this.serviceName = query.serviceName;
        this.operationName = query.operationName;
        this.fieldsKvString = toFieldsKvString(extractSecondaryFields(query));
        this.timeWindow = {
            timePreset: query.timePreset,
            startTime: query.startTime,
            endTime: query.endTime
        };
    }
}

export default new SearchBarUiStateStore();
