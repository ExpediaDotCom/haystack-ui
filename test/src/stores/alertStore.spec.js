/*
 * Copyright 2018 Expedia, Inc.
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

import {ServiceAlertsStore} from '../../../src/components/alerts/stores/serviceAlertsStore';
import {AlertDetailsStore} from '../../../src/components/alerts/stores/alertDetailsStore';

const stubService = 'stub-service';

const stubAlert = [{}];

const stubDetails = [{}];

describe('ServiceAlertsStore', () => {
    let server = null;
    const store = new ServiceAlertsStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches active alerts from API', (done) => {
        server.onGet('/api/alerts/stub-service').reply(200, stubAlert);

        store.fetchServiceAlerts(stubService);

        when(
            () => store.alerts.length > 0,
            () => {
                expect(store.alerts).to.have.length(1);
                done();
            });
    });
});

describe('AlertDetailsStore', () => {
    let server = null;
    const store = new AlertDetailsStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches alert details', (done) => {
        server.onGet('/api/alert/svc/op/type').reply(200, stubDetails);
        store.fetchAlertDetails('svc', 'op', 'type');

        when(
            () => store.alertDetails.length > 0,
            () => {
                expect(store.alertDetails).to.have.length(1);
                done();
            });
    });
});
