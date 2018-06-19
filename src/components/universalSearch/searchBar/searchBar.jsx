/*
 * Copyright 2017 Expedia, Inc.
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

/* eslint-disable react/prefer-stateless-function */


import React from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

import Autosuggest from './autosuggest';
import SearchableKeysStore from '../stores/searchableKeysStore';
import UiState from '../stores/searchBarUiStateStore';
import OperationStore from '../../../stores/operationStore';
import ServiceStore from '../../../stores/serviceStore';

@observer
// TODO create a new UI state store for searchBar
// TODO initialize it, and bubble search object up
export default class SearchBar extends React.Component {
    static propTypes = {
        search: PropTypes.object.isRequired,
        handleSearch: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        // TODO init ui state
        // uiState.init(props.search);
    }

    componentDidMount() {
        // TODO do this in UI state store
        SearchableKeysStore.fetchKeys();
        ServiceStore.fetchServices();
    }

    handleSubmit() {
        this.props.handleSearch(UiState.chips);
        event.preventDefault();

        // TODO extract search object from ui state store
        // uiState.getCurrentSearch();
    }

    render() {
        return (
            <article className="universal-search-container container">
                <Autosuggest search={this.handleSubmit} uiState={UiState} operationStore={OperationStore} serviceStore={ServiceStore} options={SearchableKeysStore.keys} />
            </article>
        );
    }
}
