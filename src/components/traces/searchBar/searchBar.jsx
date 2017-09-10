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

import SearchQueryBar from './searchQueryBar';
import {toQueryUrlString, toQuery} from '../../../utils/queryParser';
import './searchBar.less';

export default class SearchBar extends React.Component {
    static propTypes = {
        tracesSearchStore: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);

        // construct query state
        const query = toQuery(props.location.search);

        // set defaults
        if (!(query.timePreset || (query.startTime && query.endTime))) {
            query.timePreset = '5m';
        }
        query.serviceName = query.serviceName || props.match.params.serviceName || 'all';
        query.operationName = query.operationName || 'all';

        this.state = {query};

        // bind functions
        this.fetchSearchResults = this.fetchSearchResults.bind(this);
        this.searchCallback = this.searchCallback.bind(this);

        // trigger search
        this.fetchSearchResults(query);
    }

    componentWillReceiveProps(nextProps) {
        if (this.isTriggeredThroughSearchBar) {
            this.isTriggeredThroughSearchBar = false;
        } else {
            const query = toQuery(nextProps.location.search);

            this.setState({query});
            this.fetchSearchResults(query);
        }
    }

    fetchSearchResults(query) {
        this.props.tracesSearchStore.fetchSearchResults(query);
    }

    searchCallback(query) {
        this.setState({query});

        const queryUrl = `?${toQueryUrlString(query)}`;
        // push to history only if it is not the same search as the current one
        if (queryUrl !== this.props.location.search) {
            this.isTriggeredThroughSearchBar = true;
            this.props.history.push({
                search: queryUrl
            });
        }

        this.fetchSearchResults(query);
    }

    render() {
        console.log(this.state.query);
        return (
            <section className="search-bar">
                <SearchQueryBar query={this.state.query} searchCallback={this.searchCallback}/>
            </section>
        );
    }
}
