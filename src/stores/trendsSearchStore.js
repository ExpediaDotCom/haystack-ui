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
import { toQueryUrlString } from '../utils/queryParser';

function TrendException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class TrendsSearchStore {
    @observable promiseState = { case: ({empty}) => empty() };
    @observable searchResults = [];

    @action fetchSearchResults(query) {
        const queryUrlString = toQueryUrlString(query);
        this.promiseState = fromPromise(
            axios
                .get(`/api/trends?${queryUrlString}`)
                .then((result) => {
                    this.searchResults = result.data;
                })
                .catch((result) => {
                    this.searchQuery = query;
                    this.searchResults = [];
                    throw new TrendException(result);
                })
        );
    }
}

export default new TrendsSearchStore();
