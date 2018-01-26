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
import PropTypes from 'prop-types';
import DateTime from 'react-datetime';
import moment from 'moment';
import { toPresetDisplayText } from '../../utils/presets';
import './timeRangePicker.less';

export default class TimeRangePicker extends React.Component {
    static propTypes = {
        timeRangeChangeCallback: PropTypes.func.isRequired
    }

    static timePresetOptions = [
        '5m',
        '15m',
        '1h',
        '4h',
        '12h',
        '24h',
        '2d',
        '7d'
    ];

    constructor(props) {
        super(props);
        this.state = {
            startDateTime: moment().subtract(1, 'h'),
            endDateTime: moment()
        };

        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.handleCustomTimeRange = this.handleCustomTimeRange.bind(this);
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.toValid = this.toValid.bind(this);
    }

    handleCustomTimeRange() {
        this.props.timeRangeChangeCallback(null, this.state.startDateTime.valueOf(), this.state.endDateTime.valueOf());
    }

    handlePresetSelection(preset) {
        this.props.timeRangeChangeCallback(preset);
    }

    handleChangeStartDate(value) {
        this.setState({startDateTime: value});
    }

    handleChangeEndDate(value) {
        this.setState({endDateTime: value});
    }

    toValid(current) {
        return current > moment(this.state.startDateTime).subtract(1, 'day') && current < DateTime.moment();
    }

    render() {
        const PresetOption = ({preset}) => (<li key={preset}>
            <a className="timerange-picker__preset" key={preset} role="link" tabIndex={0} onClick={() => this.handlePresetSelection(preset)}>{toPresetDisplayText(preset)}</a>
        </li>);

        function fromValid(current) {
            return current.isBefore(DateTime.moment());
        }

        return (
            <div className="timerange-picker">
                <div className="timerange-picker__custom">
                    <h5>Time Range</h5>
                    <div className="form-group">
                        <h6>From :</h6>
                        <DateTime className="datetimerange-picker" isValidDate={fromValid} value={this.state.startDateTime} onChange={this.handleChangeStartDate}/>
                        <h6>To :</h6>
                        <DateTime className="datetimerange-picker" isValidDate={this.toValid} value={this.state.endDateTime} onChange={this.handleChangeEndDate}/>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm custom-timerange-apply"
                        onClick={this.handleCustomTimeRange}
                    >
                        Apply
                    </button>
                </div>
                <div className="timerange-picker__presets">
                    <h5>Presets</h5>
                    <div className="timerange-picker__presets__listblock">
                        <ul className="timerange-picker__presets__list">
                            {TimeRangePicker.timePresetOptions.map(preset => (<PresetOption key={Math.random()} preset={preset}/>))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
