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

/* eslint-disable react/prop-types, no-unused-expressions */


import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from 'chai';
import Traces from '../../../src/components/traces/traces';
import SearchBar from '../../../src/components/traces/searchBar';
import TraceResults from '../../../src/components/traces/traceResults';
import {TracesSearchStore} from '../../../src/stores/tracesSearchStore';

const stubLocation = {
    search: '?key1=value&key2=value'
};

const stubHistory = {
    location: {
        search: '?key1=value&key2=value'
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

const fulfilledPromise = {
    case: ({fulfilled}) => fulfilled()
};

const rejectedPromise = {
    case: ({rejected}) => rejected()
};

const pendingPromise = {
    case: ({pending}) => pending()
};

const stubResults = [{
    traceId: '15b83d5f-64e1-4f69-b038-aaa23rfn23r',
    root: {
        url: '',
        serviceName: '',
        operationName: ''
    },
    services: [
        {
            name: 'abc-service',
            duration: 89548,
            spanCount: 12
        },
        {
            name: 'def-service',
            duration: 89548,
            spanCount: 29
        },
        {
            name: 'ghi-service',
            duration: 89548,
            spanCount: 31
        }
    ],
    error: true,
    startTime: 1499975993,
    duration: 89548
},
    {
        traceId: '23g89z5f-64e1-4f69-b038-c123rc1c1r1',
        root: {
            url: '',
            serviceName: '',
            operationName: ''
        },
        services: [
            {
                name: 'abc-service',
                duration: 89548,
                spanCount: 11
            },
            {
                name: 'def-service',
                duration: 89548,
                spanCount: 12
            },
            {
                name: 'ghi-service',
                duration: 89548,
                spanCount: 12
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 17765
    }];

function TracesStubComponent({tracesSearchStore, history, location, match}) {
    return (<section className="traces-panel">
        <SearchBar tracesSearchStore={tracesSearchStore} history={history} location={location} match={match}/>
        <TraceResults tracesSearchStore={tracesSearchStore} history={history}/>
    </section>);
}

function createStubStore(results, promise) {
    const store = new TracesSearchStore();
    sinon.stub(store, 'fetchSearchResults', () => {
        store.searchResults = results;
        store.promiseState = promise;
    });

    return store;
}

describe('<Traces />', () => {
    it('should render Traces panel container', () => {
        const wrapper = shallow(<Traces history={stubHistory} location={stubLocation} match={stubMatch} />);
        expect(wrapper.find('.traces-panel')).to.have.length(1);
    });

    it('should trigger fetchSearchResults on mount', () => {
        const tracesSearchStore = createStubStore([]);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);

        expect(wrapper.find('.traces-panel')).to.have.length(1);
        expect(tracesSearchStore.fetchSearchResults.calledOnce);
    });

    it('should render results after getting search results', () => {
        const tracesSearchStore = createStubStore(stubResults, fulfilledPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);

        expect(tracesSearchStore.fetchSearchResults.callCount).to.equal(1);
        expect(wrapper.find('.react-bs-table-container')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(2);
    });

    it('should render error if promise is rejected', () => {
        const tracesSearchStore = createStubStore(stubResults, rejectedPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        expect(wrapper.find('.error-message')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should render loading while promise is pending', () => {
        const tracesSearchStore = createStubStore(stubResults, pendingPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should update search results on clicking search', () => {
        const tracesSearchStore = createStubStore(stubResults, fulfilledPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        wrapper.find('.traces-search-button').simulate('click');

        expect(tracesSearchStore.fetchSearchResults.callCount).to.equal(2);
        expect(wrapper.find('.react-bs-table-container')).to.have.length(1);
        expect(wrapper.find('.tr-no-border')).to.have.length(2);
    });

    it('should not show search results list on empty results', () => {
        const tracesSearchStore = createStubStore(stubResults, fulfilledPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        tracesSearchStore.fetchSearchResults.restore();
        sinon.stub(tracesSearchStore, 'fetchSearchResults', () => {
            tracesSearchStore.searchResults = [];
        });
        wrapper.find('.traces-search-button').simulate('click');

        expect(tracesSearchStore.fetchSearchResults.callCount).to.equal(1);
        expect(wrapper.find('.react-bs-table-container')).to.have.length(0);
        expect(wrapper.find('.tr-no-border')).to.have.length(0);
    });

    it('should only render service duration and percentage when a service name is present in query string', () => {
        const tracesSearchStore = createStubStore(stubResults, fulfilledPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        wrapper.find('.search-bar-text-box').simulate('change', {target: {value: 'serviceName=test'}});
        wrapper.find('.traces-search-button').simulate('click');
        expect(wrapper.find('.service-duration')).to.have.length.above(0);
        wrapper.find('.search-bar-text-box').simulate('change', {target: {value: 'no service'}});
        wrapper.find('.traces-search-button').simulate('click');
        expect(wrapper.find('.service-duration')).to.have.length(0);
    });

    it('should update URL query params on clicking search', () => {
        const tracesSearchStore = createStubStore(stubResults, fulfilledPromise);
        const wrapper = mount(<TracesStubComponent tracesSearchStore={tracesSearchStore} history={stubHistory} location={stubLocation} match={stubMatch}/>);
        wrapper.find('.search-bar-text-box').simulate('change', {target: {value: 'serviceName=test'}});
        wrapper.find('.traces-search-button').simulate('click');
        const queryA = wrapper.props().location.search;
        wrapper.find('.search-bar-text-box').simulate('change', {target: {value: 'noService'}});
        wrapper.find('.traces-search-button').simulate('click');
        const queryB = wrapper.props().location.search;
        expect(queryA === queryB).to.be.false;
    });

    it('should sort columns');

    it('should use new query for searching traces');
});
