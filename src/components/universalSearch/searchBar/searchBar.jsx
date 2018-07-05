/*
 * Copyright 2018 Expedia, Inc.
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
import SearchableKeysStore from './stores/searchableKeysStore';
import uiState from './stores/searchBarUiStateStore';
import OperationStore from '../../../stores/operationStore';
import ServiceStore from '../../../stores/serviceStore';

@observer
export default class SearchBar extends React.Component {
    static propTypes = {
        search: PropTypes.object.isRequired,
        handleSearch: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        // initialize UI state for searchBar
        // TODO implement this
        uiState.init(props.search);
    }

    componentDidMount() {
        // TODO move this inside state store's init maybe?
        SearchableKeysStore.fetchKeys();
        ServiceStore.fetchServices();
    }

    handleSubmit() {
        // TODO pass on nested objects for span level queries
        this.props.handleSearch(uiState.getCurrentSearch());
    }

    render() {
        return (
            <article className="universal-search-container container">
                <Autosuggest search={this.handleSubmit} uiState={uiState} operationStore={OperationStore} serviceStore={ServiceStore} options={SearchableKeysStore.keys} />
            </article>
        );
    }
}
