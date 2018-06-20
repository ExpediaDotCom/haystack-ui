/*
 * Copyright 2018 Expedia, Inc.
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
import {shallow} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';
import Home from '../../../src/components/home/home';
import HomeSearchBox from '../../../src/components/home/homeSearchBox';
import ServicePerformance from '../../../src/components/home/servicePerformance';
import {ServiceStore} from '../../../src/stores/serviceStore';
import {ServicePerfStore} from '../../../src/components/home/stores/servicePerfStore';


const serviceStubResults = [
    'lannister-service',
    'stark-service',
    'tyrell-service',
    'targaryen-service',
    'baratheon-service',
    'dragon-service'
];

const servicePerfStubResults = {
    children: [
        {
            serviceName: 'Service 1',
            successPercent: 90,
            failureCount: 26088,
            totalCount: 5394949947
        },
        {
            serviceName: 'Service 2',
            successPercent: 97,
            failureCount: 6001,
            totalCount: 6406933
        },
        {
            serviceName: 'Service 3',
            successPercent: 98,
            failureCount: 21632,
            totalCount: 1000000
        },
        {
            serviceName: 'Service 4',
            successPercent: 96,
            failureCount: 81338,
            totalCount: 84143
        }
    ]
};

let stubLocation = {
    search: '/'
};

const stubHistory = {
    location: {
        search: '/'
    },
    push: (location) => {
        stubLocation = location;
    }
};

function createServiceStubStore(results) {
    const store = new ServiceStore();
    store.services = [];
    sinon.stub(store, 'fetchServices', () => {
        store.services = results;
    });
    return store;
}

function createServicePerfStubStore(results) {
    const store = new ServicePerfStore();
    store.servicePerfStats = [];
    sinon.stub(store, 'fetchServicePerf', () => {
        store.servicePerfStats = results;
    });
    return store;
}

describe('<Home />', () => {
    it('should render the homepage', () => {
        const wrapper = shallow(<Home history={stubHistory}/>);
        expect(wrapper.find('.home-panel')).to.have.length(1);
    });

    it('homepage contains homesearchbox', () => {
        const wrapper = shallow(<Home history={stubHistory}/>);
        const serviceStore = createServiceStubStore(serviceStubResults);
        expect(wrapper.contains(<HomeSearchBox history={stubHistory} services={serviceStore.services}/>)).to.equal(true);
    });

    it('should render the homesearchbox', () => {
        const serviceStore = createServiceStubStore(serviceStubResults);
        const wrapper = shallow(<HomeSearchBox history={stubHistory} services={serviceStore.services}/>);
        expect(wrapper.find('.container')).to.have.length(1);
    });

    it('should URL encode service names', () => {
        const serviceStore = createServiceStubStore(serviceStubResults);
        const wrapper = shallow(<HomeSearchBox history={stubHistory} services={serviceStore.services}/>);

        wrapper.instance().handleChange({value: 'some-app'});
        expect(stubLocation).to.equal('/service/some-app/trends');

        wrapper.instance().handleChange({value: '#/something/.app/ui/test'});
        expect(stubLocation).to.equal('/service/%23%2Fsomething%2F.app%2Fui%2Ftest/trends');
    });

    it('should render the servicePerformance', () => {
        const servicePerfStore = createServicePerfStubStore(servicePerfStubResults);
        const wrapper = shallow(<ServicePerformance history={stubHistory} servicePerfStore={servicePerfStore} servicePerfStats={servicePerfStore.servicePerfStats}/>);
        expect(wrapper.find('.container')).to.have.length(1);
        expect(wrapper.find('.servicePerformance')).to.have.length(1);
    });
});
