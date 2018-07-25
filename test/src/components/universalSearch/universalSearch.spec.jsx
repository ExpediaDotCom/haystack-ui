/*
 * Copyright 2018 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the 'License");
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
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import UniversalSearch from '../../../../src/components/universalSearch/universalSearch';
import Autosuggest from '../../../../src/components/universalSearch/searchBar/autosuggest';

import uiState from '../../../../src/components/universalSearch/searchBar/stores/searchBarUiStateStore';
import {OperationStore} from '../../../../src/stores/operationStore';
import {ServiceStore} from '../../../../src/stores/serviceStore';

const stubLocation = {
    search: ''
};

const stubHistory = {
    location: {
        search: ''
    },
    push: (location) => {
        stubLocation.search = location.search;
    }
};

const stubOptions = {
    error: ['true', 'false'],
    serviceName: ['test-a', 'test-b', 'test-c']
};

// STUBS FOR BACKEND SERVICE RESPONSES
const stubSearchableKeys = ['traceId', 'spanId', 'serviceName', 'operationName', 'error'];
const stubServices = [];
const stubOperations = ['mormont-1', 'seaworth-1', 'bolton-1', 'baelish-1', 'snow-1', 'tully-1', 'dondarrion-1', 'grayjoy-1', 'clegane-1', 'drogo-1', 'tarley-1'];
// Two traces are neccessary to prevent triggering the trace details api.
const stubTraces = [{
    traceId: '15b83d5f-64e1-4f69-b038-aaa23rfn23r',
    root: {
        url: 'test-1',
        serviceName: 'test-1',
        operationName: 'test-1'
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
            url: 'test-2',
            serviceName: 'test-2',
            operationName: 'test-2'
        },
        services: [
            {
                name: 'abc-service',
                duration: 1000000,
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
    }
];

const stubShortChip = {serviceName: 'test'};

const stubLongChip = {nested_0: {serviceName: 'test', error: 'true'}};

function createOperationStubStore() {
    const store = new OperationStore();
    store.operations = ['test-operation-a', 'test-operation-b'];
    sinon.stub(store, 'fetchOperations', (val, callback) => { callback(); });
    return store;
}

function createServiceStubStore() {
    const store = new ServiceStore();
    store.services = [];
    sinon.stub(store, 'fetchServices', () => {});
    return store;
}

function createStubUiStateStore(chips = {}, timeWindow = {}) {
    const store = uiState;
    store.timeWindow = timeWindow;
    store.chips = chips;
    return store;
}

const updatedStubLocation = {
    search: '?serviceName=test-service&time.preset=1h'
};

describe('<UniversalSearch />', () => {
    let server;

    before(() => {
        server = new MockAdapter(axios);
        server.onGet('/api/traces/searchableKeys').reply(200, stubSearchableKeys);
        server.onGet('/api/alerts/root-service/unhealthyCount').reply(200, 0);
        server.onGet('/api/services').reply(200, stubServices);
        server.onGet('/api/operations?serviceName=root-service').reply(200, stubOperations);
        server.onGet(/^\/api\/traces\?/g).reply(200, stubTraces);
        server.onGet(/^\/api\/traces\/timeline\?/g).reply(200, []);
    });

    after(() => {
        server = null;
    });
    
    it('should render the universalSearch panel', () => {
        const wrapper = mount(<MemoryRouter><UniversalSearch.WrappedComponent location={stubLocation} history={stubHistory}/></MemoryRouter>);
        expect(wrapper.find('.universal-search-panel')).to.have.length(1);
    });

    it('should update the state and rerender upon new location prop', () => {
        const wrapper = shallow(<UniversalSearch.WrappedComponent location={stubLocation} history={stubHistory}/>);
        const spy = sinon.spy(UniversalSearch.WrappedComponent.prototype, 'setState');

        expect(spy.calledOnce).to.equal(false);
        wrapper.setProps({location: updatedStubLocation});

        expect(spy.calledOnce).to.equal(true);
    });

    it('should render traces trends and alerts with a serviceName query', () => {
        const stubServiceNameLocation = {search: '?serviceName=root-service&time.preset=1h'};
        const wrapper = mount(<MemoryRouter><UniversalSearch.WrappedComponent location={stubServiceNameLocation} history={stubHistory}/></MemoryRouter>);

        expect(wrapper.find('.universal-search-bar-tabs__nav-text').length).to.equal(3);
    });

    it('should render traces trends and alerts with a serviceName query', () => {
        const stubError = {search: '?error=true&time.preset=1h'};
        const wrapper = mount(<MemoryRouter><UniversalSearch.WrappedComponent location={stubError} history={stubHistory}/></MemoryRouter>);

        expect(wrapper.find('.universal-search-bar-tabs__nav-text').length).to.equal(1);
    });
});

describe('uiState', () => {
    it('should add a custom time frame to search', () => {
        const UiState = createStubUiStateStore({}, {startTime: 10, endTime: 10});
        const search = UiState.getCurrentSearch();

        expect(search.time.from).to.equal(10);
    });

    it('should add a preset time frame to search', () => {
        const UiState = createStubUiStateStore({}, {timePreset: '1h'});
        const search = UiState.getCurrentSearch();

        expect(search.time.preset).to.equal('1h');
    });
});

describe('<Autosuggest />', () => {
    it('should render the autosuggest panel', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(wrapper.find('.usb-wrapper')).to.have.length(1);
    });

    it('should populate suggestions when input is focused', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(2);
    });

    it('update suggestion string index on suggestion mouseover', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        wrapper.instance().state.suggestionIndex = 0;
        wrapper.instance().updateFieldKv({target: {value: 'e'}});
        wrapper.update();

        const firstSuggestion = wrapper.find('.usb-suggestions__field').last();
        firstSuggestion.simulate('mouseEnter');

        expect(wrapper.instance().state.suggestionIndex).to.equal(1);
    });

    it('update suggestion string index on suggestion mouseover', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        wrapper.instance().updateFieldKv({target: {value: 'e'}});
        wrapper.update();
        const firstSuggestion = wrapper.find('.usb-suggestions__field').first();
        firstSuggestion.simulate('mouseEnter');

        expect(wrapper.instance().state.suggestionIndex).to.equal(0);
    });

    it('suggestions should disappear when escape is pressed', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});

        input.prop('onKeyDown')({keyCode: 27, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
    });

    it('suggestions should disappear when an outside click occurs', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});
        const dummy = document.createElement('div');
        wrapper.instance().handleOutsideClick(dummy);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
    });

    it('should change suggestion when input is changed', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onChange')({target: {value: 'err'}});

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(1);
    });

    it('should change state with down and up arrow and upon pressing enter', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        expect(wrapper.instance().state.suggestionIndex).to.equal(null);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});

        input.prop('onKeyDown')({keyCode: 40, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(0);
        expect(wrapper.instance().state.suggestedOnType).to.equal('Keys');

        input.prop('onKeyDown')({keyCode: 38, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(1);
        expect(wrapper.instance().state.suggestedOnType).to.equal('Keys');

        input.prop('onKeyDown')({keyCode: 13, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(null);
        expect(wrapper.instance().state.suggestedOnType).to.equal('Values');
    });

    it('should be able to modify a short existing chip', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'modifyChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubShortChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        const input = wrapper.find('.usb-searchbar__input');

        expect(spy.callCount).to.equal(0);
        input.prop('onKeyDown')({keyCode: 8, preventDefault: () => {}});

        expect(spy.callCount).to.equal(1);
        Autosuggest.prototype.modifyChip.restore();
    });

    it('should be able to modify a long existing chip', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'modifyChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubLongChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        const input = wrapper.find('.usb-searchbar__input');

        expect(spy.callCount).to.equal(0);
        input.prop('onKeyDown')({keyCode: 8, preventDefault: () => {}});

        expect(spy.callCount).to.equal(1);
        sinon.restore(Autosuggest.prototype, 'modifyChip');
    });

    it('should be able to delete an existing chip', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'deleteChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubShortChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);

        wrapper.find('.usb-chip__delete').simulate('click');

        expect(spy.callCount).to.equal(1);
    });


    it('should be able to navigate suggestions with arrow keys', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});
        input.prop('onKeyDown')({keyCode: 38, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(1);
        input.prop('onKeyDown')({keyCode: 38, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(0);
        input.prop('onKeyDown')({keyCode: 38, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(1);
        input.prop('onKeyDown')({keyCode: 40, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(0);
        input.prop('onKeyDown')({keyCode: 40, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(1);
        input.prop('onKeyDown')({keyCode: 40, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionIndex).to.equal(0);
    });

    it('should be able to add a new chip with the submit button', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'updateChips');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});
        input.prop('onKeyDown')({keyCode: 38, preventDefault: () => {}});
        input.prop('onKeyDown')({keyCode: 13, preventDefault: () => {}});
        input.prop('onFocus')({target: {value: ''}});
        input.prop('onKeyDown')({keyCode: 40, preventDefault: () => {}});
        input.prop('onKeyDown')({keyCode: 13, preventDefault: () => {}});
        wrapper.find('.usb-submit__button').simulate('click');
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(spy.callCount).to.equal(1);
        expect(wrapperChips.length).to.equal(1);
        Autosuggest.prototype.updateChips.restore();
    });

    it('should be able to add nested chip with space bar', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'updateChips');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        wrapper.instance().inputRef.value = '(serviceName=test error=true)';
        input.prop('onKeyDown')({keyCode: 32, preventDefault: () => {}});
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(spy.callCount).to.equal(1);
        expect(wrapperChips.length).to.equal(1);
        Autosuggest.prototype.updateChips.restore();
    });

    it('should be able to add non-nested chip with space bar', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'updateChips');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        wrapper.instance().inputRef.value = 'serviceName=test';
        input.prop('onKeyDown')({keyCode: 32, preventDefault: () => {}});
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(spy.callCount).to.equal(1);
        expect(wrapperChips.length).to.equal(1);
        Autosuggest.prototype.updateChips.restore();
    });

    it('should fail submission with an invalid KV pair', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        wrapper.instance().inputRef.value = 'serviceName=';
        wrapper.instance().updateChips();
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(wrapperChips.length).to.equal(0);
        expect(wrapper.instance().state.inputError).to.be.a('string');
    });

    it('should fail submission with a non-whitelisted key', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        wrapper.instance().inputRef.value = 'failure=asdf';
        wrapper.instance().updateChips();
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(wrapperChips.length).to.equal(0);
        expect(wrapper.instance().state.inputError).to.be.a('string');
    });

    it('should be able to paste a query', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        wrapper.find('input').simulate('paste', {clipboardData: {getData: () => 'serviceName=asdf error=true (serviceName=abc error=true)'}});
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);
        expect(wrapperChips.length).to.equal(3);
    });
});
