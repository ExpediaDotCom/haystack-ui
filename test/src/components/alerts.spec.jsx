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

import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import { MemoryRouter } from 'react-router';

import Alerts from '../../../src/components/alerts/alerts';
import AlertsView from '../../../src/components/alerts/alertsView';
import AlertDetails from '../../../src/components/alerts/details/alertDetails';
import {ActiveAlertsStore} from '../../../src/components/alerts/stores/activeAlertsStore';
import {AlertDetailsStore} from '../../../src/components/alerts/stores/alertDetailsStore';

const stubService = 'StubService';

const fulfilledPromise = {
    case: ({fulfilled}) => fulfilled()
};

const rejectedPromise = {
    case: ({rejected}) => rejected()
};

const pendingPromise = {
    case: ({pending}) => pending()
};
const stubMatch = {
    params: {
        serviceName: 'abc-service'
    }
};

function getValue(min, max) {
    return _.round((Math.random() * (max - min)) + min, 0);
}

function getRandomTimeStamp() {
    const currentTime = ((new Date()).getTime()) * 1000;
    return (currentTime - Math.floor((Math.random() * 5000 * 60 * 1000)));
}

function getRandomValues() {
    const valuesArr = [];
    _.range(50).forEach(() => valuesArr.push({value: getValue(1000, 10000000), timestamp: getRandomTimeStamp()}));
    return valuesArr;
}

function getAlertHistoryTimestamps() {
    const currentTime = ((new Date()).getTime()) * 1000;
    const start = (currentTime - Math.floor((Math.random() * 2000000 * 60 * 1000)));
    const end = start - Math.floor((Math.random() * 5000 * 60 * 1000));
    return {
        startTimestamp: start,
        endTimestamp: end
    };
}

const stubAlerts = [
    {
        alertId: 1,
        operationName: 'test',
        type: 1,
        status: false,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 2,
        operationName: 'test',
        type: 2,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 3,
        operationName: 'test',
        type: 3,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    }
];

const stubDetails = {
    history: [
        getAlertHistoryTimestamps(),
        getAlertHistoryTimestamps()
    ]
};

function createStubActiveAlertsStore(alertResults, promise) {
    const store = new ActiveAlertsStore();

    sinon.stub(store, 'fetchServiceAlerts', () => {
        store.alerts = alertResults;
        store.promiseState = promise;
    });

    return store;
}

function createStubAlertDetailsStore(alertDetails, promise) {
    const store = new AlertDetailsStore();

    sinon.stub(store, 'fetchAlertDetails', () => {
        store.alertDetails = alertDetails;
        store.promiseState = promise;
    });

    return store;
}

describe('<Alerts />', () => {
    it('should render the alerts panel', () => {
        const wrapper = shallow(<Alerts match={stubMatch} />);
        expect(wrapper.find('.alerts-panel')).to.have.length(1);
    });
});

describe('<AlertsView />', () => {
    it('should render error if promise is rejected', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, rejectedPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsView alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.error-message_text')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should render loading if promise is pending', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, pendingPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsView alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should render the Active Alerts Table', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, fulfilledPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsView alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.loading')).to.have.length(0);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.tr-no-border')).to.have.length(3);
    });
});
describe('<AlertDetails />', () => {
    it('should render error if promise is rejected', () => {
        const detailsStore = createStubAlertDetailsStore(stubDetails, rejectedPromise);
        const wrapper = mount(<MemoryRouter><AlertDetails alertDetailsStore={detailsStore} row={stubAlerts[0]} serviceName={stubService} /></MemoryRouter>);

        expect(wrapper.find('.error-message_text')).to.have.length(1);
        expect(wrapper.find('.loading')).to.have.length(0);
        expect(wrapper.find('.alert-details-container')).to.have.length(0);
    });

    it('should render loading if promise is pending', () => {
        const detailsStore = createStubAlertDetailsStore(stubDetails, pendingPromise);
        const wrapper = mount(<MemoryRouter><AlertDetails alertDetailsStore={detailsStore} row={stubAlerts[0]} serviceName={stubService} /></MemoryRouter>);

        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.alert-details-container')).to.have.length(0);
    });
    it('should render the alert details with successful details promise', () => {
        const detailsStore = createStubAlertDetailsStore(stubDetails, fulfilledPromise);
        const wrapper = mount(<MemoryRouter><AlertDetails alertDetailsStore={detailsStore} row={stubAlerts[0]} serviceName={stubService} /></MemoryRouter>);

        expect(wrapper.find('.loading')).to.have.length(0);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.alert-details-container')).to.have.length(1);
    });
});
