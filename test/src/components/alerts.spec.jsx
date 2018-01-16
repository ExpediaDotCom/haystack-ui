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
import AlertsPanel from '../../../src/components/alerts/activeAlerts';
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

const stubAlerts = [
    {
        alertId: 1,
        operationName: 'tarley-1',
        type: 1,
        status: false,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    },
    {
        alertId: 2,
        operationName: 'tarley-1',
        type: 2,
        status: true,
        timestamp: getRandomTimeStamp(),
        value: getRandomValues()
    }
];

const stubDetails = {
    subscriptions: [
        {
            subscriptionId: '1',
            type: 'Slack',
            days: [0, 1, 2, 3, 4, 5, 6],
            time: ['0000', '2359'],
            enabled: true
        },
        {
            subscriptionId: '2',
            type: 'Email',
            days: [0, 1, 2, 3, 4, 5, 6],
            time: ['0000', '2359'],
            enabled: true
        }
    ],
    history: [
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        },
        {
            status: false,
            timestamp: getRandomTimeStamp(),
            value: getRandomValues()
        }
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

describe('<ActiveAlerts />', () => {
    it('should render error if promise is rejected', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, rejectedPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsPanel alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.error-message_text')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should render loading if promise is pending', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, pendingPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsPanel alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should render the Active Alerts Table', () => {
        const alertsStore = createStubActiveAlertsStore(stubAlerts, fulfilledPromise);
        alertsStore.fetchServiceAlerts();
        const wrapper = mount(<AlertsPanel alertsStore={alertsStore} serviceName={stubService} />);

        expect(wrapper.find('.loading')).to.have.length(0);
        expect(wrapper.find('.error-message_text')).to.have.length(0);
        expect(wrapper.find('.tr-no-border')).to.have.length(2);
    });

    it('should render the alert details upon clicking an active alert row', () => {
        const detailsStore = createStubAlertDetailsStore(stubDetails, fulfilledPromise);
        const wrapper = mount(<MemoryRouter><AlertDetails alertDetailsStore={detailsStore} row={stubAlerts[0]} serviceName={stubService} /></MemoryRouter>);

        expect(wrapper.find('.alert-details__details-list')).to.have.length(1);
    });
});
