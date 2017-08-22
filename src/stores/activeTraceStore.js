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

function TraceException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

function calculateDuration(spans) {
    return spans.reduce((a, b) => a + b.duration, 0);
}

export class ActiveTraceStore {
    @observable spans = [];
    @observable startTime = {};
    @observable totalDuration = {};
    @observable promiseState = null;
    @action fetchTraceDetails() {
        this.promiseState = fromPromise(
            axios
                .get('/api/tracetests')
                .then((result) => {
                    this.startTime = result.data[0].timestamp;
                    this.totalDuration = calculateDuration(result.data);
                    this.spans = result.data;
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }
}

export default new ActiveTraceStore();
