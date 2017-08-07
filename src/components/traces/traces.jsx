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

import './traces.less';
import SearchBar from './searchBar';
import TraceResults from './traceResults';
import tracesSearchStore from '../../stores/tracesSearchStore';

const Traces = ({history, location, match}) => (
    <section className="traces-panel">
        <SearchBar tracesSearchStore={tracesSearchStore} history={history} location={location} match={match}/>
        <TraceResults tracesSearchStore={tracesSearchStore} history={history}/>
    </section>
);

Traces.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
};

export default Traces;
