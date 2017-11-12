/* eslint-disable react/prefer-stateless-function */
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

import TrendsHeader from './trendsHeader';
import TrendResults from './results/trendResults';
import trendsSearchStore from '../../stores/trendsSearchStore';

const Trends = ({match, location, history}) => (
    <section className="trends-panel">
        <TrendsHeader store={trendsSearchStore} serviceName={match.params.serviceName} location={location} history={history}/>
        <TrendResults trendsSearchStore={trendsSearchStore} serviceName={match.params.serviceName} location={location}/>
    </section>);

Trends.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

export default Trends;
