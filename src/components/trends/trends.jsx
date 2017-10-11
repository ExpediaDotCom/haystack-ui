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
import moment from 'moment';

import TrendResults from './trendResults';
import trendsSearchStore from '../../stores/trendsSearchStore';
import './trends.less';
import TrendHeaderToolbar from './trendHeaderToolbar';

export default class Trends extends React.Component {

    static propTypes = {
        match: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.timeRangeCallback = this.timeRangeCallback.bind(this);
        this.triggerTrendResults = this.triggerTrendResults.bind(this);
    }

    componentDidMount() {
        const defaultTimeRange = {
            from: moment(new Date()).subtract(900, 'seconds').valueOf(),
            until: moment(new Date()).valueOf()};
        const defaultTimeWindow = '1min';
        this.triggerTrendResults(defaultTimeRange, defaultTimeWindow);
    }

    triggerTrendResults(timeRange, timeWindow) {
        const query = {
            serviceName: `${this.props.match.params.serviceName}`,
            timeWindow,
            from: timeRange.from,
            until: timeRange.until
        };
        trendsSearchStore.fetchSearchResults(query);
    }

    timeRangeCallback(timeRange, timeWindow) {
        this.triggerTrendResults(timeRange, timeWindow);
    }

    render() {
        return (
            <section className="trends-panel">
                <TrendHeaderToolbar timeRangeCallback={this.timeRangeCallback}/>
                <TrendResults trendsSearchStore={trendsSearchStore} />
            </section>
        );
    }
}
