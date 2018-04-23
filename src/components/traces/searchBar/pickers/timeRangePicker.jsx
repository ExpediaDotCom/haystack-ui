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

import TimeRangeWindow from '../../../common/timeRangeWindow';
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

        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.handleCustomTimeRange = this.handleCustomTimeRange.bind(this);
    }

    handleCustomTimeRange(window) {
        this.props.timeRangeChangeCallback(null, window.from, window.to);
    }

    handlePresetSelection(preset) {
        this.props.timeRangeChangeCallback(preset);
    }

    render() {
        const PresetOption = ({preset}) => (<li key={preset}>
            <a className="timerange-picker__preset" key={preset} role="link" tabIndex={0} onClick={() => this.handlePresetSelection(preset)}>{toPresetDisplayText(preset)}</a>
        </li>);

        return (
            <div className="timerange-picker">
                <TimeRangeWindow
                    className="timerange-picker__custom"
                    customTimeRangeChangeCallback={this.handleCustomTimeRange}
                />
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
