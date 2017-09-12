
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
import {toFieldsObject, isValidFieldKvString, dateIsValid, extractSecondaryFields} from '../utils/traceQueryParser';

export class SearchBarUiStateStore {
  @observable serviceName = null;
  @observable operationName = null;

  @observable fields = {};
  @observable fieldsError = false;

  @observable timeWindow = {};
  @observable timeWindowError = false;

  @observable displayErrors = {};

  @action setServiceName(serviceName) {
    this.serviceName = serviceName;
  }

  @action setOperationName(operationName) {
    this.operationName = operationName;
  }

  @action setTimeWindow(timeWindow) {
    if (dateIsValid(...timeWindow)) {
      this.timeWindow = timeWindow;
      this.timeWindowError = false;
    } else {
      this.timeWindowError = true;
    }
  }

  @action setFieldsUsingKvString(fieldsKvString) {
    if (isValidFieldKvString(fieldsKvString)) {
      this.fields = toFieldsObject(fieldsKvString);
      this.fieldsError = false;
    } else {
      this.fieldsError = true;
    }
  }

  @action setDisplayErrors(displayErrors) {
    this.displayErrors = displayErrors;
  }

  @action initUsingQuery(query) {
    this.serviceName = query.serviceName;
    this.operationName = query.operationName;

    this.timeWindow = {
      timePreset: query.timePreset,
      startTime: query.startTime,
      endTime: query.endTime
    };
    this.timeWindowError = false;

    this.fields = extractSecondaryFields(query);
    this.fieldsError = false;

    this.displayErrors = {};
  }
}

export default new SearchBarUiStateStore();
