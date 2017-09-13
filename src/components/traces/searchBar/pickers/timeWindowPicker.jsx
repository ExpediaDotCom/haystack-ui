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
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimeRangePicker from './timeRangePicker';
import toPresetDisplayText from '../../utils/presets';

import uiState from '../searchBarUiStateStore';

@observer
export default class TimeWindowPicker extends React.Component {
  static propTypes = {
    uiState: PropTypes.object.isRequired
  };

  static getTimeRangeText(timePreset, startTime, endTime) {
    if (timePreset) {
      return toPresetDisplayText(timePreset);
    }

    const start = moment(parseInt(startTime, 10));
    const end = moment(parseInt(endTime, 10));
    return `${start.format('L')} ${start.format('LTS')} - ${end.format('L')} ${end.format('LTS')}`;
  }

  constructor(props) {
    super(props);

    this.handleTimeRangePicker = this.handleTimeRangePicker.bind(this);
    this.timeRangeChangeCallback = this.timeRangeChangeCallback.bind(this);

    this.state = {showTimeRangePicker: false};
  }

  handleTimeRangePicker() {
    if (this.state.showTimeRangePicker) {
      this.setState({showTimeRangePicker: false});
    } else {
      this.setState({showTimeRangePicker: true});
    }
  }

  timeRangeChangeCallback(timePreset, startTime, endTime) {
    uiState.setTimeWindow({timePreset, startTime, endTime});
    this.setState({timeRangePickerToggleText: TimeWindowPicker.getTimeRangeText(timePreset, startTime, endTime)});
    this.setState({showTimeRangePicker: false});
  }

  render() {
    const {
          timePreset,
          startTime,
          endTime
      } = uiState.timeWindow;

    const timeRangePickerToggleText = TimeWindowPicker.getTimeRangeText(timePreset, startTime, endTime);

    return (
        <div className="search-bar-pickers_time-window">
          <span>
              <button
                  className="btn btn-primary time-range-picker-toggle btn-lg"
                  type="button"
                  onClick={this.handleTimeRangePicker}
              >
                  {timeRangePickerToggleText}
              </button>
          </span>
          { this.state.showTimeRangePicker
              ? <TimeRangePicker timeRangeChangeCallback={this.timeRangeChangeCallback}/>
              : null }
        </div>
    );
  }
}
