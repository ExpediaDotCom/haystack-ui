/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the License);
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an AS IS BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

import { expect } from 'chai';
import axios from 'axios';
import { when } from 'mobx';
import MockAdapter from 'axios-mock-adapter';

import {TracesSearchStore} from '../../../src/components/traces/stores/tracesSearchStore';

const stubTrace = [{
    traceId: 'test-stub',
    spanCount: 34,
    services: [
        {
            name: 'test-stub',
            spanCount: 16
        },
        {
            name: 'test-stub',
            spanCount: 18
        }
    ],
    root: {
        url: 'test-stub',
        serviceName: 'test-stub',
        operationName: 'test-stub',
        duration: 3404000,
        error: false
    },
    queriedService: {
        duration: 23000,
        durationPercent: 99,
        error: false
    },
    queriedOperation: {
        duration: 1,
        durationPercent: 0,
        error: false
    },
    startTime: 1510686424051000,
    duration: 240000,
    error: false
}];

describe('TracesSearchStore', () => {
    let server = null;
    const store = new TracesSearchStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches traces from the api with a query', (done) => {
        server.onGet('/api/traces?serviceName=test-query&startTime=1000&endTime=1000').reply(200, stubTrace);

        store.fetchSearchResults({serviceName: 'test-query', startTime: 1, endTime: 1});

        when(
            () => store.searchResults.length > 0,
            () => {
                expect(store.searchResults).to.have.length(1);
                done();
            });
    });
});

