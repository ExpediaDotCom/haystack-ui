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
        timeRangeCallback: PropTypes.func.isRequired
    };

    static timePresetOptions = [900, 3600, 21600, 43200, 86400, 604800];

    static getTimeWindowSeconds(timeRangeSec) {
        if (timeRangeSec <= 900) {
            return 60;
        } else if (timeRangeSec <= 21600) {
            return 300;
        } else if (timeRangeSec <= 43200) {
            return 900;
        }
        return 3600;
    }

    static getTimeWindowLabel(timeRangeSec) {
        if (timeRangeSec <= 900) {
            return `${timeRangeSec / 60}m`;
        } else if (timeRangeSec <= 86400) {
            return `${timeRangeSec / 3600}h`;
        }
        return `${timeRangeSec / 86400}d`;
    }

    static getTimeRange(presetValue) {
        return {
            from: moment(new Date()).subtract(presetValue, 'seconds').valueOf(),
            until: moment(new Date()).valueOf()
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            activePresetValue: TrendHeaderToolbar.timePresetOptions[0]
        };
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
    }

    handlePresetSelection(presetValue, timeWindow) {
        this.setState({activePresetValue: presetValue});
        this.props.timeRangeCallback(TrendHeaderToolbar.getTimeRange(presetValue), timeWindow);
        event.preventDefault();
    }

    render() {
        const PresetOption = ({presetLabel, presetValue, timeWindow}) => (
            <button
                className={presetValue === this.state.activePresetValue ? 'btn btn-primary' : 'btn btn-default'}
                key={presetLabel}
                onClick={() => this.handlePresetSelection(presetValue, timeWindow)}
            >
                {presetLabel}
            </button>
        );

        return (
            <div className="trend-header-toolbar clearfix">
                <h3 className="pull-left op_trends_header">Trends</h3>
                <div className="btn-group pull-right">
                    {TrendHeaderToolbar.timePresetOptions.map(presetValue => (
                        <PresetOption
                            presetLabel={TrendHeaderToolbar.getTimeWindowLabel(presetValue)}
                            presetValue={presetValue}
                            timeWindow={TrendHeaderToolbar.getTimeWindowSeconds(presetValue)}
                        />))}
                </div>
            </div>
           );
    }
}
