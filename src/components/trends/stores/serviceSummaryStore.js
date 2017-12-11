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

import axios from 'axios';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';
import { toQueryUrlString } from '../../../utils/queryParser';

function SummaryException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class ServiceSummaryStore {
    @observable summaryPromiseState = { case: ({empty}) => empty() };
    @observable trendsPromiseState = { case: ({empty}) => empty() };
    @observable summaryResults = [];
    @observable summaryQuery = {};
    @observable trendsResults = [];
    @observable trendsQuery = {};

    @action fetchServiceSummaryResults(service, query, isCustomTimeRange) {
        const queryUrlString = toQueryUrlString(query);
        this.summaryPromiseState = fromPromise(
                axios
                    .get(`/api/trends/${service}/summary?${queryUrlString}`)
                    .then((result) => {
                        this.summaryQuery = {...query, isCustomTimeRange};
                        this.summaryResults = result.data;
                    })
                    .catch((result) => {
                        this.summaryQuery = {...query, isCustomTimeRange};
                        this.summaryResults = [];
                        throw new SummaryException(result);
                    })
        );
    }
    @action fetchTrendOperationResults(service, query) {
        const queryUrlString = toQueryUrlString(query);
        this.trendsPromiseState = fromPromise(
            axios
                .get(`/api/trends/${service}/summary/getTrends?${queryUrlString}`)
                .then((result) => {
                    this.trendsResults = result.data;
                    this.trendsQuery = query;
                })
                .catch((result) => {
                    this.trendsQuery = query;
                    this.trendsResults = [];
                    throw new SummaryException(result);
                })
        );
    }
}

export default new ServiceSummaryStore();
