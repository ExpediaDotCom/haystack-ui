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

function calculateStartTime(spans) {
    return spans.reduce((earliestTime, span) =>
        (earliestTime ? Math.min(earliestTime, span.timestamp) : span.timestamp), null
    );
}

function calculateDuration(spans, start) {
    const end = spans.reduce((latestTime, span) =>
        (latestTime ? Math.max(latestTime, (span.timestamp + span.duration)) : (span.timestamp + span.duration)), null
    );
    return (end - start) * 1.05;
}

function getTimePointers(totalDuration) {
    let timePointers = [];
    const pointerDurations = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
        .map(dur => (totalDuration * dur));
    const leftOffset = [0.12, 0.27, 0.39, 0.52, 0.65, 0.78]
        .map(lo => (lo * 100));
    timePointers = leftOffset.map((p, i) => ({leftOffset: p, time: `${pointerDurations[i] / 1000}ms`}));
    return timePointers;
}

export class ActiveTraceStore {
    @observable spans = [];
    @observable startTime = {};
    @observable totalDuration = {};
    @observable promiseState = null;
    @observable timePointers = [];
    @action fetchTraceDetails(traceId) {
        this.promiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}`)
                .then((result) => {
                    this.spans = result.data;
                    this.startTime = calculateStartTime(this.spans);
                    this.totalDuration = calculateDuration(this.spans, this.startTime);
                    this.timePointers = getTimePointers(this.totalDuration);
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }
}

export default new ActiveTraceStore();
