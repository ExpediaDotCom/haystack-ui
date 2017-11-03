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
import DateTime from 'react-datetime';
import moment from 'moment';
import timeWindow from '../utils/timeWindow';

export default class TrendTimeRangePicker extends React.Component {
    static propTypes = {
        customTimeRangeChangeCallback: PropTypes.func.isRequired,
        activeWindow: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
           activeWindow: this.props.activeWindow
        };

        this.handleCustomSelection = this.handleCustomSelection.bind(this);
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.toValid = this.toValid.bind(this);
    }

    handleCustomSelection() {
        this.props.customTimeRangeChangeCallback(this.state.activeWindow);
    }

    handleChangeStartDate(value) {
        const updatedFrom = moment(value).valueOf();
        const updatedTimeWindow = timeWindow.toCustomTimeRange(updatedFrom, this.state.activeWindow.until);
        this.setState({activeWindow: updatedTimeWindow});
    }

    handleChangeEndDate(value) {
        const updatedUntil = moment(value).valueOf();
        const updatedTimeWindow = timeWindow.toCustomTimeRange(this.state.activeWindow.from, updatedUntil);
        this.setState({activeWindow: updatedTimeWindow});
    }

    toValid(current) {
        return current > moment(parseInt(this.state.activeWindow.from, 10)).subtract(1, 'day') && current < DateTime.moment();
    }

    render() {
        function fromValid(current) {
            return current.isBefore(DateTime.moment());
        }

        return (
            <div className="custom-timerange-picker">
                <div className="form-group">
                    <div>From :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime"
                        isValidDate={fromValid}
                        value={moment(parseInt(this.state.activeWindow.from, 10))}
                        onChange={this.handleChangeStartDate}
                    />
                    <div>To :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime"
                        isValidDate={this.toValid}
                        value={moment(parseInt(this.state.activeWindow.until, 10))}
                        onChange={this.handleChangeEndDate}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm pull-right"
                    onClick={this.handleCustomSelection}
                >
                    Apply
                </button>
            </div>
        );
    }
}
