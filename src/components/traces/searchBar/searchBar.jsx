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
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import SearchQueryBar from './searchQueryBar';
import {toQueryUrlString, toQuery} from '../../../utils/queryParser';
import {toFieldsKvString} from '../../traces/utils/traceQueryParser';
import './searchBar.less';

export default class SearchBar extends React.Component {
    static propTypes = {
        tracesSearchStore: PropTypes.object.isRequired,
        serviceStore: PropTypes.object.isRequired,
        operationStore: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired
    };

    static addDefaultParams(query, serviceNameParam) {
        const augmentedQuery = {...query};
        if (!(query.timePreset || (query.startTime && query.endTime))) {
            augmentedQuery.timePreset = '1h';
        }
        augmentedQuery.serviceName = query.serviceName || serviceNameParam;
        augmentedQuery.operationName = query.operationName;

        return augmentedQuery;
    }

    constructor(props) {
        super(props);

        // construct query state
        const query = SearchBar.addDefaultParams(
            toQuery(props.location.search),
            props.match.params.serviceName);
        this.state = {query};

        // bind functions
        this.fetchSearchResults = this.fetchSearchResults.bind(this);
        this.searchCallback = this.searchCallback.bind(this);
    }

    componentDidMount() {
        if (this.state.query.serviceName) {
            this.fetchSearchResults(this.state.query);
        }
    }

    componentWillReceiveProps(nextProps) {
        const query = SearchBar.addDefaultParams(
            toQuery(nextProps.location.search),
            nextProps.match.params.serviceName);

        this.setState({query});
        this.fetchSearchResults(query);
    }

    fetchSearchResults(query) {
        this.props.tracesSearchStore.fetchSearchResults(query);
    }

    searchCallback(query) {
        this.setState({query});

        const queryUrl = `?${toQueryUrlString(query)}`;
        // push to history only if it is not the same search as the current one
        if (queryUrl !== this.props.location.search) {
            this.props.history.push({
                search: queryUrl
            });
        }

        ReactGA.event({
            category: 'Trace Search',
            action: 'via Search Bar',
            label: `${toFieldsKvString(query)}`
        });

        this.fetchSearchResults(query);
    }

    render() {
        return (
            <section className="search-bar">
                <SearchQueryBar query={this.state.query} serviceStore={this.props.serviceStore} operationStore={this.props.operationStore} searchCallback={this.searchCallback}/>
            </section>
        );
    }
}
