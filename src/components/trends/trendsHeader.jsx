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


import React from 'react';
import PropTypes from 'prop-types';

import timeWindow from './utils/timeWindow';

import './trendsHeader.less';

export default class TrendsHeader extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.fetchTrends = this.fetchTrends.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);

        const defaultWindow = timeWindow.presets[1]; // TODO check and pick time window from url query param
        const defaultGranularity = timeWindow.getHigherGranularity(defaultWindow.value);

        this.state = {
            activeWindowValue: defaultWindow.value,
            activeGranularity: defaultGranularity
        };

        this.fetchTrends(defaultWindow.value, defaultGranularity.value);
    }

    handleTimeChange(event) {
        const windowValue = event.target.value;
        this.setState({activeWindowValue: windowValue});

        this.fetchTrends(windowValue, timeWindow.getHigherGranularity(windowValue).value);
    }

    fetchTrends(windowValue, granularityValue) {
        const timeRange = timeWindow.toTimeRange(windowValue);

        const query = {
            granularity: granularityValue,
            from: timeRange.from,
            until: timeRange.until
        };

        this.props.store.fetchTrendServiceResults(this.props.serviceName, query);
    }

    render() {
        return (<div className="clearfix">
                <div className="pull-right">
                    <span>Showing summary for </span>
                    <select className="trend-summary__time-range-selector" value={this.state.activeWindowValue} onChange={this.handleTimeChange}>
                        {timeWindow.presets.map(preset => (<option value={preset.value}>last {preset.longName}</option>))}
                    </select>
                </div>
            </div>
        );
    }
}
