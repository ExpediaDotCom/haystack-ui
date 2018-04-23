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
import {observer} from 'mobx-react';

import './timeRangeWindow.less';
import timeRangeStore from '../../stores/timeRangeStore';

@observer
export default class TimeRangeWindow extends React.Component {
    static propTypes = {
        customTimeRangeChangeCallback: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired
    };

    static isFromValid(current) {
        return current.isBefore(DateTime.moment());
    }

    static isToValid(current) {
        return moment(timeRangeStore.fromTime).isSameOrBefore(current, 'ms') && current.isBefore(DateTime.moment());
    }

    static changeFromTime(time) {
        timeRangeStore.fromTime = time;
    }

    static changeToTime(time) {
        timeRangeStore.toTime = time;
    }

    constructor(props) {
        super(props);

        this.handleApply = this.handleApply.bind(this);
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

    handleApply() {
        document.removeEventListener('keyup', this.checkForEnterPress);
        this.props.customTimeRangeChangeCallback({ from: timeRangeStore.fromTime.valueOf(), to: timeRangeStore.toTime.valueOf() });
    }


    render() {
        return (
            <div className={this.props.className}>
                <div className="form-group">
                    <div>From :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime custom-timerange-picker__datetime-from"
                        isValidDate={TimeRangeWindow.isFromValid}
                        value={timeRangeStore.fromTime}
                        onChange={TimeRangeWindow.changeFromTime}
                    />
                    <div>To :</div>
                    <DateTime
                        className="custom-timerange-picker__datetime"
                        isValidDate={TimeRangeWindow.isToValid}
                        value={timeRangeStore.toTime}
                        onChange={TimeRangeWindow.changeToTime}
                    />
                </div>
                <button
                    type="button"
                    className="btn-apply btn btn-primary btn-sm custom-timerange-apply pull-right"
                    onClick={this.handleApply}
                >
                    Apply
                </button>
            </div>
        );
    }
}
