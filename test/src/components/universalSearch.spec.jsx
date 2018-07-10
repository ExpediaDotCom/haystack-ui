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
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';

import UniversalSearch from '../../../src/components/universalSearch/universalSearch';
import Autosuggest from '../../../src/components/universalSearch/searchBar/autosuggest';

import uiState from '../../../src/components/universalSearch/searchBar/stores/searchBarUiStateStore';
import {OperationStore} from '../../../src/stores/operationStore';
import {ServiceStore} from '../../../src/stores/serviceStore';

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

const stubOptions = {
    serviceName: ['test-a', 'test-b', 'test-c'],
    error: ['true', 'false']
};

const stubShortChip = {serviceName: 'test'};

const stubLongChip = {nested_0: {serviceName: 'test', error: 'true'}};

function createOperationStubStore() {
    const store = new OperationStore();
    store.operations = ['test-operation-a', 'test-operation-b'];
    sinon.stub(store, 'fetchOperations', () => {});
    return store;
}

function createServiceStubStore() {
    const store = new ServiceStore();
    store.services = [];
    sinon.stub(store, 'fetchServices', () => {});
    return store;
}

function createStubUiStateStore(chips = {}) {
    const store = uiState;
    store.chips = chips;
    return store;
}

const updatedStubLocation = {
    search: '?serviceName=test-service&time.preset=1h'
};

describe('<UniversalSearch />', () => {
    it('should render the universalSearch panel`', () => {
        const wrapper = mount(<MemoryRouter><UniversalSearch.WrappedComponent location={stubLocation} history={stubHistory}/></MemoryRouter>);
        expect(wrapper.find('.universal-search-panel')).to.have.length(1);
    });

    it('should update the state and rerender upon new location prop`', () => {
        const wrapper = shallow(<UniversalSearch.WrappedComponent location={stubLocation} history={stubHistory}/>);
        const spy = sinon.spy(UniversalSearch.WrappedComponent.prototype, 'setState');

        expect(spy.calledOnce).to.equal(false);
        wrapper.setProps({location: updatedStubLocation});

        expect(spy.calledOnce).to.equal(true);
    });
});

describe('<Autosuggest />', () => {
    it('should render the autosuggest panel`', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(wrapper.find('.usb-wrapper')).to.have.length(1);
    });

    it('should populate suggestions when input is focused`', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(2);
    });

    it('suggestions should disappear when escape is pressed`', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});

        input.prop('onKeyDown')({keyCode: 27, preventDefault: () => {}});
        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
    });

    it('suggestions should disappear when an outside click occurs`', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onFocus')({target: {value: ''}});
        const dummy = document.createElement('div');
        wrapper.instance().handleOutsideClick(dummy);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
    });

    it('should change suggestion when input is changed`', () => {
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        input.prop('onChange')({target: {value: 'err'}});

        expect(wrapper.instance().state.suggestionStrings.length).to.equal(1);
    });

    it('should change state with down and up arrow and upon pressing enter`', () => {
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

    it('should be able to modify a short existing chip`', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'modifyChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubShortChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        const input = wrapper.find('.usb-searchbar__input');

        expect(spy.callCount).to.equal(0);
        input.prop('onKeyDown')({keyCode: 8, preventDefault: () => {}});

        expect(spy.callCount).to.equal(1);
        Autosuggest.prototype.modifyChip.restore();
    });

    it('should be able to modify a long existing chip`', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'modifyChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubLongChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        const input = wrapper.find('.usb-searchbar__input');

        expect(spy.callCount).to.equal(0);
        input.prop('onKeyDown')({keyCode: 8, preventDefault: () => {}});

        expect(spy.callCount).to.equal(1);
        sinon.restore(Autosuggest.prototype, 'modifyChip');
    });

    it('should be able to delete an existing chip`', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'deleteChip');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore(stubShortChip)} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);

        wrapper.find('.usb-chip__delete').simulate('click');

        expect(spy.callCount).to.equal(1);
    });

    it('should be able to add a new chip with the submit button`', () => {
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

    it('should be able to add a new chip with space bar`', () => {
        const spy = sinon.spy(Autosuggest.prototype, 'updateChips');
        const wrapper = mount(<Autosuggest options={stubOptions} uiState={createStubUiStateStore()} search={() => {}} serviceStore={createServiceStubStore()} operationStore={createOperationStubStore()}/>);
        expect(spy.callCount).to.equal(0);
        const input = wrapper.find('.usb-searchbar__input');
        wrapper.instance().inputRef.value = '(serviceName=test error=true)';
        input.prop('onKeyDown')({keyCode: 32, preventDefault: () => {}});
        const wrapperChips = Object.keys(wrapper.instance().props.uiState.chips);

        expect(spy.callCount).to.equal(1);
        expect(wrapperChips.length).to.equal(1);
    });
});
