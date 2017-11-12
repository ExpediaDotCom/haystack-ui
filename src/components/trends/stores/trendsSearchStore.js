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

function TrendException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class TrendsSearchStore {
    @observable resultsPromiseState = { case: ({empty}) => empty() };
    @observable detailsPromiseState = { case: ({empty}) => empty() };
    @observable serviceResults = [];
    @observable serviceQuery = {};
    @observable operationResults = [];
    @observable operationQuery = {};

    @action fetchTrendServiceResults(service, query, isCustomTimeRange, operationName) {
        const queryUrlString = toQueryUrlString(query);
        this.resultsPromiseState = fromPromise(
                axios
                    .get(`/api/trends/${service}?${queryUrlString}`)
                    .then((result) => {
                        this.serviceQuery = {...query, isCustomTimeRange, operationName};
                        this.serviceResults = result.data;
                    })
                    .catch((result) => {
                        this.serviceQuery = {...query, isCustomTimeRange, operationName};
                        this.serviceResults = [];
                        throw new TrendException(result);
                    })
        );
    }
    @action fetchTrendOperationResults(service, operation, query) {
        const queryUrlString = toQueryUrlString(query);
        this.detailsPromiseState = fromPromise(
            axios
                .get(`/api/trends/${service}/${operation}?${queryUrlString}`)
                .then((result) => {
                    this.operationResults = result.data;
                    this.operationQuery = query;
                })
                .catch((result) => {
                    this.operationQuery = query;
                    this.operationResults = [];
                    throw new TrendException(result);
                })
        );
    }
}

export default new TrendsSearchStore();
