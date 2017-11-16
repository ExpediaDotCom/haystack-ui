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
import { mount } from 'enzyme';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';

import Header from '../../../src/components/layout/header';
import Footer from '../../../src/components/layout/footer';
import ServiceTools from '../../../src/components/layout/serviceTools';

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

const stubMatch = {
    params: {
        serviceName: 'abc-service'
    }
};

describe('<Header />', () => {
    it('should render the Header with functioning search bar', () => {
        const wrapper = mount(<MemoryRouter><Header history={stubHistory}/></MemoryRouter>);
        expect(wrapper.find('.navbar-header')).to.have.length(1);
    });
});

describe('<Footer />', () => {
    it('should render the NoMatch panel`', () => {
        const wrapper = mount(<MemoryRouter><Footer /></MemoryRouter>);
        expect(wrapper.find('.primary-footer')).to.have.length(1);
    });
});

describe('<ServiceTools />', () => {
    it('should render the NoMatch panel`', () => {
        const wrapper = mount(<MemoryRouter><ServiceTools history={stubHistory} match={stubMatch} location={stubHistory.location.search} /></MemoryRouter>);
        expect(wrapper.find('.serviceToolsTab__tabs')).to.have.length(1);
    });
});
