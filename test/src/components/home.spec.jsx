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
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import Home from '../../../src/components/home/home';
import HomeSearchBox from '../../../src/components/home/homeSearchBox';
import {ServiceStore} from '../../../src/stores/serviceStore';


const stubResults = [
    'lannister-service',
    'stark-service',
    'tyrell-service',
    'targaryen-service',
    'baratheon-service',
    'dragon-service'
];

const stubLocation = {
    search: '/'
};

const stubHistory = {
    location: {
        search: '/'
    },
    push: (location) => {
        stubLocation.search = location.search;
    }
};

function createStubStore(results) {
    const store = new ServiceStore();
    store.services = [];
    sinon.stub(store, 'fetchServices', () => {
        store.services = results;
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
        const serviceStore = createStubStore(stubResults);
        expect(wrapper.contains(<HomeSearchBox history={stubHistory} services={serviceStore.services}/>)).to.equal(true);
    });

    it('should render the homesearchbox', () => {
        const serviceStore = createStubStore(stubResults);
        const wrapper = shallow(<HomeSearchBox history={stubHistory} services={serviceStore.services}/>);
        expect(wrapper.find('.container')).to.have.length(1);
    });
});
