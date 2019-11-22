/*
 * Copyright 2019 Expedia Group
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

/* eslint-disable no-unused-expressions */
import React from 'react';
import sinon from 'sinon';
import {expect} from 'chai';
import {shallow} from 'enzyme';

import timeWindow from '../../../../src/utils/timeWindow';

import ServiceInsights from '../../../../src/components/serviceInsights/serviceInsights';

function createStoreStub(promiseState, data = {}) {
    return {
        serviceInsights: data,
        fetchServiceInsights: sinon.stub(),
        hasValidSearch: true,
        promiseState: {
            case: (resp) => resp[promiseState]()
        }
    };
}

describe('<ServiceInsights/>', () => {
    describe('Rendering', () => {
        it('should render info message if no service is defined', () => {
            const wrapper = shallow(<ServiceInsights search={{}} store={{}} />);

            expect(wrapper.find('.select-service-msg')).to.have.lengthOf(1);
        });

        it('should render <Loading/> component if data is loading', () => {
            const store = createStoreStub('pending');
            const wrapper = shallow(<ServiceInsights search={{serviceName: 'web-ui'}} store={store} />);
            expect(wrapper.find('.service-insights__loading')).to.have.lengthOf(1);
        });

        it('should render <Error/> component if data is loading', () => {
            const store = createStoreStub('rejected');
            const wrapper = shallow(<ServiceInsights search={{serviceName: 'web-ui'}} store={store} />);
            expect(wrapper.find('Error')).to.have.lengthOf(1);
        });

        it('should render expected components when valid data is present', () => {
            const store = createStoreStub('fulfilled', {
                summary: {tracesConsidered: 5},
                nodes: [{}],
                links: []
            });

            const wrapper = shallow(<ServiceInsights search={{serviceName: 'web-ui'}} store={store} />);
            expect(wrapper.find('Summary')).to.have.lengthOf(1);
            expect(wrapper.find('ServiceInsightsGraph')).to.have.lengthOf(1);
        });

        it('should render relationship filter when it’s applicable', () => {
            const store = createStoreStub('fulfilled', {
                summary: {tracesConsidered: 5},
                nodes: [{}],
                links: []
            });

            const wrapper = shallow(<ServiceInsights search={{serviceName: 'web-ui'}} store={store} />);

            expect(wrapper.find('.service-insights__filter')).to.have.lengthOf(1);
        });

        it('should not render relationship filter when it’s not applicable', () => {
            const store = createStoreStub('fulfilled', {
                summary: {tracesConsidered: 1},
                nodes: [{}],
                links: []
            });

            const wrapper = shallow(<ServiceInsights search={{traceId: 'abc123'}} store={store} />);

            expect(wrapper.find('.service-insights__filter')).to.have.lengthOf(0);
        });
    });

    describe('getServiceInsight()', () => {
        it('should call fetchServiceInsights with default timewindow', () => {
            const search = {serviceName: 'web-ui'};
            const store = createStoreStub('pending');
            shallow(<ServiceInsights search={search} store={store} />);

            const queryParams = store.fetchServiceInsights.getCall(0).args[0];
            expect(queryParams.serviceName).to.equal(search.serviceName);
            expect(queryParams.startTime).to.exist;
            expect(queryParams.endTime).to.exist;
        });

        it('should call toCustomTimeRange when search includes timeframe', () => {
            const search = {
                serviceName: 'web-ui',
                time: {
                    from: '123',
                    to: '456'
                }
            };
            const store = createStoreStub('pending');
            timeWindow.toCustomTimeRange = sinon.stub().returns({value: 'foo'});
            shallow(<ServiceInsights search={search} store={store} />);

            sinon.assert.calledWith(timeWindow.toCustomTimeRange, '123', '456');
        });

        it('should call toTimeRange with preset values when search includes preset', () => {
            const search = {
                serviceName: 'web-ui',
                time: {
                    preset: '1h'
                }
            };

            const store = createStoreStub('pending');
            timeWindow.toTimeRange = sinon.stub().returns({});
            shallow(<ServiceInsights search={search} store={store} />);

            sinon.assert.calledWith(timeWindow.toTimeRange, 3600000);
        });

        it('should render an error message when no traces found', () => {
            const search = {
                serviceName: 'web-ui',
                time: {
                    preset: '1h'
                }
            };

            const store = createStoreStub('fulfilled', {
                nodes: []
            });
            const wrapper = shallow(<ServiceInsights search={search} store={store} />);

            expect(wrapper.find('Error')).to.have.length(1);
        });

        it('handles select view filter', () => {
            const mockStore = {
                fetchServiceInsights: sinon.spy()
            };
            const mockHistory = {
                push: sinon.spy(),
                location: {
                    pathname: '/search',
                    search: '?serviceName=web-ui&tabId=serviceInsights'
                }
            };
            const expectedUrl = '/search?serviceName=web-ui&tabId=serviceInsights&relationship=upstream';
            const instance = shallow(<ServiceInsights search={{}} store={mockStore} history={mockHistory} />).instance();
            instance.handleSelectViewFilter({
                target: {
                    value: 'upstream'
                }
            });
            expect(mockHistory.push.calledWith(expectedUrl)).to.equal(true);
        });
    });
});
