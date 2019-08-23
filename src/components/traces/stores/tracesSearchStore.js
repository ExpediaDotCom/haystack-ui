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

import axios from 'axios';
import {action, observable} from 'mobx';
import {fromPromise} from 'mobx-utils';

import {toDurationMicroseconds} from '../utils/presets';
import {toQueryUrlString} from '../../../utils/queryParser';
import {ErrorHandlingStore} from '../../../stores/errorHandlingStore';
import timeWindow from '../../../utils/timeWindow';

export function formatResults(results) {
    return results.map((result) => {
        const flattenedResult = {...result};
        flattenedResult.rootUrl = result.root.url;
        flattenedResult.rootOperation = `${result.root.serviceName}: ${result.root.operationName}`;
        flattenedResult.rootError = result.root.error;
        flattenedResult.operationDuration = result.queriedOperation && result.queriedOperation.duration;
        flattenedResult.operationError = result.queriedOperation && result.queriedOperation.error;
        flattenedResult.operationDurationPercent = result.queriedOperation && result.queriedOperation.durationPercent;
        flattenedResult.serviceDuration = result.queriedService && result.queriedService.duration;
        flattenedResult.serviceDurationPercent = result.queriedService && result.queriedService.durationPercent;

        return flattenedResult;
    });
}

export class TracesSearchStore extends ErrorHandlingStore {
    @observable traceResultsPromiseState = { case: ({empty}) => empty() };
    @observable timelinePromiseState = null;
    @observable searchQuery = {};
    @observable apiQuery = {};
    @observable searchResults = [];
    @observable timelineResults = {};
    @observable totalCount = 0;
    @observable granularity = null;

    @action fetchSearchResults(query) {
        const serviceName = decodeURIComponent(query.serviceName);
        const operationName = (!query.operationName || query.operationName === 'all') ? null : decodeURIComponent(query.operationName);
        const startTime = query.startTime ? query.startTime * 1000 : ((Date.now() * 1000) - toDurationMicroseconds(query.timePreset));
        const ARTIFICIAL_DELAY = 45 * 1000;  // artificial delay of 45 sec to get completed traces
        const endTime = query.endTime ? query.endTime * 1000 : (Date.now() - ARTIFICIAL_DELAY) * 1000;
        const granularity = timeWindow.getHigherGranularity((endTime / 1000) - (startTime / 1000)) * 1000;

        const apiQuery = {...query,
            serviceName,
            operationName,
            startTime,
            endTime,
            timePreset: null
        };

        const queryUrlString = toQueryUrlString(apiQuery);

        this.fetchTraceResults(queryUrlString);
        this.fetchTimeline(queryUrlString, granularity);
        this.searchQuery = query;
        this.apiQuery = apiQuery;
        this.granularity = granularity;
    }

    @action fetchTraceResults(queryUrlString) {
        this.traceResultsPromiseState = fromPromise(
            axios
            .get(`/api/traces?${queryUrlString}`)
            .then((result) => {
                this.searchResults = formatResults(result.data);
            })
            .catch((result) => {
                this.searchResults = [];
                TracesSearchStore.handleError(result);
            })
        );
    }

    @action fetchTimeline(queryUrlString, granularity) {
        this.timelinePromiseState = fromPromise(
            axios
            .get(`/api/traces/timeline?${queryUrlString}&granularity=${granularity}`)
            .then((result) => {
                this.timelineResults = result.data;
                this.totalCount = this.timelineResults.reduce((acc, point) => (acc + point.y), 0);
            })
            .catch((result) => {
                this.timelineResults = [];
                this.totalCount = 0;
                TracesSearchStore.handleError(result);
            })
        );
    }
}

export default new TracesSearchStore();
