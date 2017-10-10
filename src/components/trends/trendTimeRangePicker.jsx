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

export default class TrendTimeRangePicker extends React.Component {

    static propTypes = {
        timeRangeCallback: PropTypes.func.isRequired
    };

    static timePresetOptions = [
        {label: '15m', value: '900', timeWindow: '1min'},
        {label: '1h', value: '3600', timeWindow: '5min'},
        {label: '6h', value: '21600', timeWindow: '5min'},
        {label: '12h', value: '43200', timeWindow: '15min'},
        {label: '24h', value: '86400', timeWindow: '1hour'},
        {label: '7d', value: '604800', timeWindow: '1hour'}
    ];

    static getTimeRange(presetValue) {
        return {from: moment(new Date()).subtract(presetValue, 'seconds').valueOf(), until: moment(new Date()).valueOf()};
    }

    constructor(props) {
        super(props);
        this.state = {
          activePreset: '15m'
        };
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
    }

    handlePresetSelection(presetLabel, presetValue, timeWindow) {
        this.setState({activePreset: presetLabel});
        this.props.timeRangeCallback(TrendTimeRangePicker.getTimeRange(presetValue), timeWindow);
        event.preventDefault();
    }

    render() {
        const PresetOption = ({presetLabel, presetValue, timeWindow}) => (
            <button
                className={presetLabel === this.state.activePreset ? 'btn btn-primary' : 'btn btn-default'}
                key={presetLabel}
                onClick={() => this.handlePresetSelection(presetLabel, presetValue, timeWindow)}
            >
                {presetLabel}
            </button>
        );

        return (<div className="btn-group">
            {TrendTimeRangePicker.timePresetOptions.map(preset => (
                <PresetOption presetLabel={preset.label} presetValue={preset.value} timeWindow={preset.timeWindow}/>))}
        </div>);
    }
}
