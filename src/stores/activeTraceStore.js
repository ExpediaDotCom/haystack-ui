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
import traceDetailsFormatters from '../components/traces/utils/traceDetailsFormatters';

function TraceException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export function setChildExpandState(timelineSpans, parentId, display) {
    const parent = timelineSpans.find(s => s.spanId === parentId);
    parent.children.forEach((childId) => {
        const childSpan = timelineSpans.find(s => s.spanId === childId);
        childSpan.display = display;
        childSpan.expanded = display;
        setChildExpandState(timelineSpans, childSpan.spanId, display);
    });
}

export class ActiveTraceStore {
    @observable promiseState = null;
    @observable spans = [];
    @observable rootSpan = [];
    @observable timelineSpans = [];
    @observable startTime = null;
    @observable totalDuration = null;
    @observable timePointers = [];

    @action fetchTraceDetails(traceId) {
        this.promiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}`)
                .then((result) => {
                    // raw and process span data
                    this.spans = result.data;
                    this.rootSpan = this.spans.find(span => !span.parentSpanId);
                    this.timelineSpans = traceDetailsFormatters.createSpanTimeline(this.spans, this.rootSpan);
                    // timing information
                    this.startTime = traceDetailsFormatters.calculateStartTime(this.spans);
                    this.totalDuration = traceDetailsFormatters.calculateDuration(this.spans, this.startTime);
                    this.timePointers = traceDetailsFormatters.getTimePointers(this.totalDuration);
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }

    @action toggleExpand(selectedParentId) {
        const parent = this.timelineSpans.find(s => s.spanId === selectedParentId);
        setChildExpandState(this.timelineSpans, selectedParentId, !parent.expanded);
        parent.expanded = !parent.expanded;
    }
}

export default new ActiveTraceStore();
