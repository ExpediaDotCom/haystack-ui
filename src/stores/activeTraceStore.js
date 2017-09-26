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

function spanTreeDepths(spanTree, initialDepth) {
    const initial = {};
    initial[spanTree.span.spanId] = initialDepth;
    if (spanTree.children.length === 0) return initial;
    return (spanTree.children || []).reduce((prevMap, child) => {
        const childDepths = spanTreeDepths(child, initialDepth + 1);
        return {
            ...prevMap,
            ...childDepths
        };
    }, initial);
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

function getSpanChilds(spanTree) {
    const firstNode = [];
    firstNode[spanTree.span.spanId] = spanTree.children.map(span => span.span.spanId);
    if (spanTree.children.length === 0) return firstNode;
    return (spanTree.children || []).reduce((prevMap, child) => {
        const parentChild = getSpanChilds(child);
        return {
            ...prevMap,
            ...parentChild
        };
    }, firstNode);
}

function getSpans(spanTree) {
    const firstNode = [];
    firstNode.push(spanTree.span);
    return (spanTree.children || []).reduce((prevMap, child) => {
        const parentChild = getSpans(child);
        return [
            ...prevMap,
            ...parentChild
        ];
    }, firstNode);
}

export class ActiveTraceStore {
    @observable spans = [];
    @observable fromSpanTree = [];
    @observable startTime = {};
    @observable totalDuration = {};
    @observable promiseState = null;
    @observable timePointers = [];
    @observable rootSpan = [];
    @observable spanTree = [];
    @observable spanTreeDepths = [];
    @observable spanChildren = [];
    @action fetchTraceDetails(traceId) {
        this.promiseState = fromPromise(
            axios
                .get(`/api/trace/${traceId}`)
                .then((result) => {
                    this.spans = result.data;
                    this.backupSpans = result.data;
                    this.startTime = calculateStartTime(this.spans);
                    this.totalDuration = calculateDuration(this.spans, this.startTime);
                    this.timePointers = getTimePointers(this.totalDuration);
                    this.rootSpan = this.spans.find(span => !span.parentSpanId);
                    this.spanTree = createSpanTree(this.rootSpan, this.spans);
                    this.spanTreeDepths = spanTreeDepths(this.spanTree, 1);
                    this.spanChildren = getSpanChilds(this.spanTree);
                    this.fromSpanTree = getSpans(this.spanTree);
                })
                .catch((result) => {
                    throw new TraceException(result);
                })
        );
    }

    @action toggleExpandCollapse(spans, selectedParentId, expand){
        const selectedParentChildrenId = this.spanChildren[selectedParentId];
        if (expand) {
            selectedParentChildrenId.forEach(childId => _.remove(spans, span => span.spanId === childId));
        } else {
            selectedParentChildrenId.forEach(childId => spans.push(this.backupSpans.find(bkSpan => bkSpan.spanId === childId)));
        }
        const rootSpan = spans.find(span => !span.parentSpanId);
        const spanTree = createSpanTree(rootSpan, spans);
        this.fromSpanTree = getSpans(spanTree);
    }
}

export default new ActiveTraceStore();
