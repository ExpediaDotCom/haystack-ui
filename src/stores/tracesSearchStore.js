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
import timeago from 'timeago.js';
import { fromPromise } from 'mobx-utils';
import { toQueryUrlString } from '../utils/queryParser';

function getTotalSpanCount(services) {
    return services.reduce((sum, service) => sum + service.spanCount, 0);
}

function getFormattedTimestamp(startTime) {
    return new Date(startTime * 1000).toLocaleString();
}

function TraceException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

function formatResults(results) {
    return results.map((result) => {
        const formattedResult = {...result};

        formattedResult.timeago = timeago().format(result.startTime * 1000);
        formattedResult.timestamp = getFormattedTimestamp(result.startTime);
        formattedResult.rootUrl = result.root.url;
        formattedResult.rootOperation = `${result.root.serviceName}: ${result.root.operationName}`;
        formattedResult.spans = getTotalSpanCount(result.services);
        formattedResult.serviceDuration = result.services[0].duration;
        formattedResult.serviceDurationPercent = Math.round(Math.random() * 100);
        formattedResult.traceId = result.traceId;

        return formattedResult;
    });
}

export class TracesSearchStore {
    @observable promiseState = null;
    @observable searchQuery = null;
    @observable searchResults = [];

    @action fetchSearchResults(query) {
        const queryUrlString = toQueryUrlString(query);
        this.promiseState = fromPromise(
            axios
                .get(`/api/traces?${queryUrlString}`)
                .then((result) => {
                    this.searchQuery = query;
                    this.searchResults = formatResults(result.data);
                })
                .catch((result) => {
                    this.searchQuery = query;
                    this.searchResults = [];
                    throw new TraceException(result);
                })
        );
    }
}

export default new TracesSearchStore();
