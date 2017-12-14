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

/* eslint-disable react/prop-types, no-unused-expressions */

import { expect } from 'chai';
import axios from 'axios';
import { when } from 'mobx';
import MockAdapter from 'axios-mock-adapter';


import {OperationStore} from '../../../src/components/trends/stores/operationStore';
import {ServiceStore} from '../../../src/components/trends/stores/serviceStore';

const stubTime = {granularity: 1, from: 2, until: 3};
const stubService = 'TestService';
const stubOperation = 'TestOperation';
const stubType = 'IncomingRequests';
const stubTrend = [{
    operationName: 'test-1',
    count: 18800,
    successPercent: 82,
    tp99Duration: [
        {
            value: 1717214,
            timestamp: 1511209957436
        },
        {
            value: 6534480,
            timestamp: 1511209897436
        }
    ]
}];
describe('OperationStore', () => {
    let server = null;
    const store = new OperationStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches operation stats', (done) => {
        server.onGet('/api/trends/operation/TestService?granularity=1&from=2&until=3').reply(200, stubTrend);

        store.fetchStats(stubService, stubTime);

        when(
            () => store.statsResults.length > 0,
            () => {
                expect(store.statsResults).to.have.length(1);
                done();
            });
    });

    it('fetches operation trends', (done) => {
        server.onGet('/api/trends/operation/TestService/TestOperation?granularity=1&from=2&until=3').reply(200, stubTrend);

        store.fetchTrends(stubService, stubOperation, stubTime);

        when(
            () => store.trendsResults.length > 0,
            () => {
                expect(store.trendsResults).to.have.length(1);
                done();
            });
    });
});
describe('ServiceStore', () => {
    let server = null;
    const store = new ServiceStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches service stats', (done) => {
        server.onGet('/api/trends/service/TestService?granularity=1&from=2&until=3').reply(200, stubTrend);

        store.fetchStats(stubService, stubTime);

        when(
            () => store.statsResults.length > 0,
            () => {
                expect(store.statsResults).to.have.length(1);
                done();
            });
    });

    it('fetches service trends', (done) => {
        server.onGet('/api/trends/service/TestService/IncomingRequests?granularity=1&from=2&until=3').reply(200, stubTrend);

        store.fetchTrends(stubService, stubType, stubTime);

        when(
            () => store.trendsResults.length > 0,
            () => {
                expect(store.trendsResults).to.have.length(1);
                done();
            });
    });
});
