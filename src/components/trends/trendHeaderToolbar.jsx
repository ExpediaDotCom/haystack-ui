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
import './trends.less';

export default class TrendHeaderToolbar extends React.Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        trendsSearchStore: PropTypes.object.isRequired
    };

    static timePresetOptions = [900, 3600, 21600, 43200, 86400, 604800];

    static getTimespanSeconds(timeRangeSec) {
        if (timeRangeSec <= 3000) {
            return 60;
        } else if (timeRangeSec <= 18000) {
            return 300;
        } else if (timeRangeSec <= 54000) {
            return 900;
        }

        return 3600;
    }

    static getPresetLabel(presetSeconds) {
        if (presetSeconds <= 900) {
            return `${presetSeconds / 60}m`;
        } else if (presetSeconds <= 86400) {
            return `${presetSeconds / 3600}h`;
        }
        return `${presetSeconds / 86400}d`;
    }

    static getTimeRange(presetValue) {
        return {
            from: moment(new Date()).subtract(presetValue, 'seconds').valueOf(),
            until: moment(new Date()).valueOf()
        };
    }

    constructor(props) {
        super(props);

        const defaultTimeRange = TrendHeaderToolbar.timePresetOptions[1];

        this.state = {
            activePresetValue: defaultTimeRange
        };
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.fetchTrends = this.fetchTrends.bind(this);
    }

    fetchTrends(timeRange, timespan) {
        const query = {
            serviceName: `${this.props.match.params.serviceName}`,
            timespan,
            from: timeRange.from,
            until: timeRange.until
        };
        this.props.trendsSearchStore.fetchTrendResults(query);
    }

    handlePresetSelection(presetValue, timespan) {
        this.setState({activePresetValue: presetValue});
        this.fetchTrends(TrendHeaderToolbar.getTimeRange(presetValue), timespan);
        event.preventDefault();
    }

    render() {
        const PresetOption = ({presetLabel, presetValue, timespan}) => (
            <button
                className={presetValue === this.state.activePresetValue ? 'btn btn-primary' : 'btn btn-default'}
                key={presetLabel}
                onClick={() => this.handlePresetSelection(presetValue, timespan)}
            >
                {presetLabel}
            </button>
        );

        return (
            <div className="trend-header-toolbar clearfix">
                <div className="btn-group pull-right">
                    {TrendHeaderToolbar.timePresetOptions.map(presetValue => (
                        <PresetOption
                            key={presetValue}
                            presetLabel={TrendHeaderToolbar.getPresetLabel(presetValue)}
                            presetValue={presetValue}
                            timespan={TrendHeaderToolbar.getTimespanSeconds(presetValue)}
                        />))}
                </div>
            </div>
       );
    }
}
