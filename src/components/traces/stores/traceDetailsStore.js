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

import axios from 'axios';
import _ from 'lodash';
import {observable, action, computed} from 'mobx';
import { fromPromise } from 'mobx-utils';

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

function createSpanTree(span, trace, groupByParentId = null) {
    const spansWithParent = _.filter(trace, s => s.parentSpanId);
    const grouped = groupByParentId !== null ? groupByParentId : _.groupBy(spansWithParent, s => s.parentSpanId);
    return {
        span,
        children: (grouped[span.spanId] || [])
        .map(s => createSpanTree(s, trace, grouped))
    };
}

function createFlattenedSpanTree(spanTree, depth, traceStartTime, totalDuration) {
    return [observable({
        ...spanTree.span,
        children: spanTree.children.map(child => child.span.spanId),
        startTimePercent: (((spanTree.span.startTime - traceStartTime) / totalDuration) * 100),
        depth,
        expandable: !!spanTree.children.length,
        display: true,
        expanded: true
    })]
    .concat(_.flatMap(spanTree.children, child => createFlattenedSpanTree(child, depth + 1, traceStartTime, totalDuration)));
}

export class TraceDetailsStore {
    @observable promiseState = null;
    @observable spans = [];

    @action fetchTraceDetails(traceId) {
        this.promiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}`)
                .then((result) => {
                    this.spans = result.data;
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }

    @computed
    get rootSpan() {
        return this.spans.find(span => !span.parentSpanId);
    }

    @computed
    get startTime() {
        return this.spans.reduce(
            (earliestTime, span) => (earliestTime ? Math.min(earliestTime, span.startTime) : span.startTime),
            null);
    }

    @computed
    get totalDuration() {
        const end = this.spans.reduce((latestTime, span) =>
            (latestTime ? Math.max(latestTime, (span.startTime + span.duration)) : (span.startTime + span.duration)), null
        );
        const difference = end - this.startTime;
        return difference || 1;
    }

    @computed
    get timelineSpans() {
        if (this.spans.length === 0) return [];

        const tree = createSpanTree(this.rootSpan, this.spans);
        return createFlattenedSpanTree(tree, 0, this.startTime, this.totalDuration);
    }

    @computed
    get maxDepth() {
        return this.timelineSpans.reduce((max, span) => Math.max(max, span.depth), 0);
    }

    @action toggleExpand(selectedParentId) {
        const parent = this.timelineSpans.find(s => s.spanId === selectedParentId);
        setChildExpandState(this.timelineSpans, selectedParentId, !parent.expanded);
        parent.expanded = !parent.expanded;
    }

    @observable latencyCost = [];
    @observable latencyCostPromiseState = null ;

    @action getLatencyCost(traceId) {
        this.latencyCostPromiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}/latencyCost`)
                .then((result) => {
                    this.latencyCost = Object.entries(result.data);
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }
}

export default new TraceDetailsStore();
