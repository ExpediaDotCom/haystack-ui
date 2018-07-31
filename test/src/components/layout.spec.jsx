/*
 * Copyright 2018 Expedia Group
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
import {mount, shallow} from 'enzyme';
import {expect} from 'chai';
import {MemoryRouter} from 'react-router-dom';
import sinon from 'sinon';

import Header from '../../../src/components/layout/header';
import Footer from '../../../src/components/layout/footer';
import ServiceTools from '../../../src/components/layout/serviceTools';
import HeaderSearchInterstitial from '../../../src/components/layout/headerSearchInterstitial';
import {TraceDetailsStore} from '../../../src/components/traces/stores/traceDetailsStore';


const fulfilledPromise = {
    case: ({fulfilled}) => fulfilled()
};

const rejectedPromise = {
    case: ({rejected}) => rejected()
};

const pendingPromise = {
    case: ({pending}) => pending()
};

let stubLocation = {
    search: '/'
};

const stubHistory = {
    location: {
        search: '/',
        pathname: '/service/some-service/traces'
    },
    push: (location) => {
        stubLocation = location;
    }
};

const stubMatch = {
    params: {
        serviceName: 'abc-service',
        traceId: 'trace-id'
    }
};

const stubDetails = [
    {
        traceId: 'test-trace-id',
        spanId: 'test-span-1',
        serviceName: 'test-service',
        operationName: 'test',
        startTime: 1504784384000,
        duration: 3500000,
        logs: [
            {
                timestamp: 1504784384000,
                fields: [{
                    key: 'event',
                    value: 'sr'
                },
                    {
                        key: 'event',
                        value: 'cs'
                    }
                ]
            }
        ],
        tags: [
            {
                key: 'success',
                value: 'true'
            }
        ]
    },
    {
        traceId: 'test-trace-id',
        spanId: 'test-span-2',
        parentSpanId: 'test-span-1',
        serviceName: 'test-service',
        operationName: 'test',
        startTime: 1504785384000,
        duration: 2000000,
        logs: [
            {
                timestamp: 1504784384000,
                fields: [{
                    key: 'event',
                    value: 'sr'
                },
                    {
                        key: 'event',
                        value: 'cs'
                    }
                ]
            }
        ],
        tags: [
            {
                key: 'success',
                value: 'false'
            }
        ]
    },
    {
        traceId: 'test-trace-id',
        spanId: 'test-span-3',
        parentSpanId: 'test-span-1',
        serviceName: 'test-service',
        operationName: 'test',
        startTime: 1504785384000,
        duration: 2000000,
        logs: [
            {
                timestamp: 1504784384000,
                fields: [{
                    key: 'event',
                    value: 'sr'
                },
                    {
                        key: 'event',
                        value: 'cs'
                    }
                ]
            }
        ],
        tags: [
            {
                key: 'success',
                value: 'false'
            }
        ]
    },
    {
        traceId: 'test-trace-id',
        spanId: 'test-span-4',
        parentSpanId: 'test-span-1',
        serviceName: 'test-service',
        operationName: 'test',
        startTime: 1504785384000,
        duration: 2000000,
        logs: [
            {
                timestamp: 1504784384000,
                fields: [{
                    key: 'event',
                    value: 'sr'
                },
                    {
                        key: 'event',
                        value: 'cs'
                    }
                ]
            }
        ],
        tags: [
            {
                key: 'success',
                value: 'false'
            }
        ]
    }
];

function createStubDetailsStore(spans, promise) {
    const store = new TraceDetailsStore();
    sinon.stub(store, 'fetchTraceDetails', () => {
        store.spans = spans;
        store.promiseState = promise;
    });

    return store;
}

describe('<HeaderSearchInterstitial />', () => {
    it('should successfully redirect upon receiving successful trace details', () => {
        const store = createStubDetailsStore(stubDetails, fulfilledPromise);
        const wrapper = mount(<MemoryRouter><HeaderSearchInterstitial match={stubMatch} traceDetailsStore={store} /></MemoryRouter>);
        expect(wrapper.find('Redirect')).to.have.length(1);
    });

    it('should not redirect upon pending trace details', () => {
        const store = createStubDetailsStore(stubDetails, pendingPromise);
        const wrapper = mount(<MemoryRouter><HeaderSearchInterstitial match={stubMatch} traceDetailsStore={store} /></MemoryRouter>);
        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('Redirect')).to.have.length(0);
    });

    it('should not redirect upon receiving a failed trace', () => {
        const store = createStubDetailsStore(stubDetails, rejectedPromise);
        const wrapper = mount(<MemoryRouter><HeaderSearchInterstitial match={stubMatch} traceDetailsStore={store} /></MemoryRouter>);
        expect(wrapper.find('.error-message_text')).to.have.length(1);
        expect(wrapper.find('Redirect')).to.have.length(0);
    });
});

describe('<Header />', () => {
    it('should render the Header with functioning search bar', () => {
        const wrapper = mount(<MemoryRouter><Header history={stubHistory}/></MemoryRouter>);
        expect(wrapper.find('.navbar-header')).to.have.length(1);
    });
});

describe('<Footer />', () => {
    it('should render the footer`', () => {
        const wrapper = mount(<MemoryRouter><Footer /></MemoryRouter>);
        expect(wrapper.find('.primary-footer')).to.have.length(1);
    });
});

describe('<ServiceTools />', () => {
    it('should render the service tools tabs panel`', () => {
        const wrapper = shallow(<ServiceTools history={stubHistory} match={stubMatch} location={stubHistory.location} />);

        expect(wrapper.find('.serviceToolsTab__title-name')).to.have.length(1);
    });

    it('should URL encode service names', () => {
        const wrapper = shallow(<ServiceTools history={stubHistory} match={stubMatch} location={stubHistory.location}/>);

        wrapper.instance().handleServiceChange({value: 'some-app'});
        expect(stubLocation).to.equal('/service/some-app/traces');

        wrapper.instance().handleServiceChange({value: '#/something/.app/ui/test'});
        expect(stubLocation).to.equal('/service/%23%2Fsomething%2F.app%2Fui%2Ftest/traces');
    });
});
