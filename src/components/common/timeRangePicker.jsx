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
import './timeRangePicker.less';

export default class TrendTimeRangePicker extends React.Component {
    static propTypes = {
        customTimeRangeChangeCallback: PropTypes.func.isRequired,
        from: PropTypes.number.isRequired,
        to: PropTypes.number.isRequired
    };

    static isFromValid(current) {
        return current.isBefore(DateTime.moment());
    }

    constructor(props) {
        super(props);
        this.state = {
           from: moment(this.props.from),
           to: moment(this.props.to)
        };

        this.handleApply = this.handleApply.bind(this);
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.isToValid = this.isToValid.bind(this);
        this.checkForEnterPress = this.checkForEnterPress.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keyup', this.checkForEnterPress);
    }

    checkForEnterPress(e) {
        if (e.keyCode === 13) {
            this.handleApply();
        }
    }

    handleFromChange(from) {
        this.setState({from});
    }

    handleToChange(to) {
        this.setState({to});
    }

    handleApply() {
        document.removeEventListener('keyup', this.checkForEnterPress);
        this.props.customTimeRangeChangeCallback({ from: this.state.from.valueOf(), to: this.state.to.valueOf() });
    }

    isToValid(current) {
        return this.state.from.isSameOrBefore(current, 'ms') && current.isBefore(DateTime.moment());
    }

    render() {
        const {from, to} = this.state;

        return (
            <div className="custom-timerange-picker">
                <div className="form-group">
                    <div>From :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime custom-timerange-picker__datetime-from"
                        isValidDate={TrendTimeRangePicker.isFromValid}
                        value={from}
                        onChange={this.handleFromChange}
                    />
                    <div>To :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime"
                        isValidDate={this.isToValid}
                        value={to}
                        onChange={this.handleToChange}
                    />
                </div>
                <button
                    type="button"
                    className="btn-apply btn btn-primary btn-sm pull-right"
                    onClick={this.handleApply}
                >
                    Apply
                </button>
            </div>
        );
    }
}
