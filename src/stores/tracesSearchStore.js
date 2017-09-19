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
import moment from 'moment';
import { fromPromise } from 'mobx-utils';
import { toQueryUrlString } from '../utils/queryParser';

function getTotalSpanCount(services) {
    return services.reduce((sum, service) => sum + service.spanCount, 0);
}

function getFormattedTimestamp(startTime) {
    return moment(startTime * 1000).format('kk:mm:ss.SSS, DD MMM YY');
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
        formattedResult.serviceDuration = result.queriedSvcDur;
        formattedResult.serviceDurationPercent = result.queriedSvcDurPerc < 1 ? result.queriedSvcDurPerc.toFixed(1) : Math.round(result.queriedSvcDurPerc);
        formattedResult.traceId = result.traceId;
        formattedResult.error = (result.rootSpanSuccess || result.queriedServiceSuccess || result.queriedOperationSuccess) === false ? false : result.queriedOperationSuccess;
        return formattedResult;
    });
}

export class TracesSearchStore {
    @observable promiseState = { case: ({empty}) => empty() };
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
