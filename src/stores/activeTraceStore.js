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
import _ from 'lodash';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';
import formatters from '../utils/formatters';

function TraceException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

function calculateStartTime(spans) {
    return spans.reduce((earliestTime, span) =>
        (earliestTime ? Math.min(earliestTime, span.startTime) : span.startTime), null
    );
}

function calculateDuration(spans, start) {
    const end = spans.reduce((latestTime, span) =>
        (latestTime ? Math.max(latestTime, (span.startTime + span.duration)) : (span.startTime + span.duration)), null
    );
    const difference = end - start;
     return difference || 1;
}

function getTimePointers(totalDuration) {
    const pointerDurations = [0.0, 0.25, 0.50, 0.75, 1.0]
        .map(dur => (totalDuration * dur));
    const leftOffset = [0.12, 0.32, 0.52, 0.72, 0.92]
        .map(lo => (lo * 100));
    return leftOffset.map((p, i) => ({leftOffset: p, time: formatters.toDurationString(pointerDurations[i])}));
}

function createSpanTree(span, trace, groupByParentId = null) {
    const spansWithParent = trace.filter(s => s.parentSpanId);
    const grouped = groupByParentId !== null ? groupByParentId : _
        .groupBy(spansWithParent, s => s.parentSpanId);
    return {
        span,
        children: (grouped[span.spanId] || [])
            .map(s => createSpanTree(s, trace, grouped))
    };
}

function createFlattenedSpanTree(spanTree, depth) {
  return [observable({
    ...spanTree.span,
    children: spanTree.children.map(child => child.span.spanId),
    depth,
    expandable: !!spanTree.children.length,
    display: true,
    expanded: true
  })]
  .concat(_.flatMap(spanTree.children, child => createFlattenedSpanTree(child, depth + 1)));
}

function createSpanTimeline(spans, root) {
  const tree = createSpanTree(root, spans);
  return createFlattenedSpanTree(tree, 0);
}

function setChildExpandState(timelineSpans, parentId, display) {
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
    @observable startTime = {};
    @observable totalDuration = {};
    @observable timePointers = [];

    @action fetchTraceDetails(traceId) {
        this.promiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}`)
                .then((result) => {
                    // raw and process span data
                    this.spans = result.data;
                    this.rootSpan = this.spans.find(span => !span.parentSpanId);
                    this.timelineSpans = createSpanTimeline(this.spans, this.rootSpan);

                    // timing information
                    this.startTime = calculateStartTime(this.spans);
                    this.totalDuration = calculateDuration(this.spans, this.startTime);
                    this.timePointers = getTimePointers(this.totalDuration);
             })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }

    @action toggleExpand(selectedParentId) {
        const parent = this.timelineSpans.find(s => s.spanId === selectedParentId);

        const isExpanded = parent.expanded;
        parent.expanded = !isExpanded;

        setChildExpandState(this.timelineSpans, selectedParentId, !isExpanded);
    }
}

export default new ActiveTraceStore();
