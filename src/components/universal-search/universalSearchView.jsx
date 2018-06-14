/* eslint-disable react/prefer-stateless-function */
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

import React from 'react';
import {observer} from 'mobx-react';
import Header from './layout/header';
import Footer from '../layout/footer';
import Tabs from './tabs/tabs';
import './universalSearchView.less';
import serviceGraphStore from '../serviceGraph/stores/serviceGraphStore';
import tracesSearchStore from '../traces/stores/tracesSearchStore';
import Autosuggest from './autosuggest';
import SearchableKeysStore from './stores/searchableKeysStore';
import UiState from './stores/searchBarUiStateStore';
import OperationStore from '../../stores/operationStore';
import ServiceStore from '../../stores/serviceStore';

@observer
export default class UniversalSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        serviceGraphStore.fetchServiceGraph();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        SearchableKeysStore.fetchKeys();
        ServiceStore.fetchServices();
    }

    handleSubmit() {
        const query = UiState.chips.join('&');
        tracesSearchStore.fetchSearchResults(query);
        this.setState({query});
        event.preventDefault();
    }

    render() {
        return (
            <article>
                <Header/>
                <article className="universal-search-container container">
                    <Autosuggest search={this.handleSubmit} uiState={UiState} operationStore={OperationStore} serviceStore={ServiceStore} options={SearchableKeysStore.keys} />
                </article>
                {
                    this.state.query ?
                        <Tabs/>
                        : (<section className="universal-search-tab__content">
                            <div className="container">
                                <section className="text-center">
                                    <div className="no-search_text">
                                        <h5>Start with query for serviceName, traceId, or any other <a
                                            href="https://github.com/ExpediaDotCom/haystack-ui/blob/master/server/connectors/traces/haystack/tracesConnector.js#L52"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                                whitelisted key
                                            </a>
                                        </h5>
                                    </div>
                                </section>
                            </div>
                        </section>)
                }
                <Footer/>
            </article>
        );
    }
}
