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
import Clipboard from 'react-copy-to-clipboard';
import {Link} from 'react-router-dom';
import DateTime from 'react-datetime';
import moment from 'moment';

import timeWindow from '../utils/timeWindow';
import metricGranularity from '../utils/metricGranularity';

import './trendDetailsToolbar.less';

export default class TrendHeaderToolbar extends React.Component {

    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        trendsSearchStore: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        opName: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.fetchTrends = this.fetchTrends.bind(this);
        this.toggleGranularityDropdown = this.toggleGranularityDropdown.bind(this);
        this.updateGranularity = this.updateGranularity.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleCustomSelection = this.handleCustomSelection.bind(this);
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.handleCustomSelection = this.handleCustomSelection.bind(this);
        this.handleCustomTimeRangePicker = this.handleCustomTimeRangePicker.bind(this);
        this.toValid = this.toValid.bind(this);
        const defaultWindow = timeWindow.findMatchingPreset(props.trendsSearchStore.serviceQuery.until - props.trendsSearchStore.serviceQuery.from);
        const defaultGranularity = timeWindow.getLowerGranularity(defaultWindow.value);
        const timeRange = timeWindow.toTimeRange(defaultWindow.value);

        this.state = {
            activeWindow: defaultWindow,
            activeGranularity: defaultGranularity,
            granularityDropdownOpen: false,
            showCustomTimeRangePicker: false,
            startDateTime: timeRange.from,
            endDateTime: timeRange.until
        };
    }

    componentDidMount() {
        this.fetchTrends(this.state.startDateTime, this.state.endDateTime, this.state.activeGranularity);
    }

    handleCopy() {
        this.setState({showCopied: true});
        setTimeout(() => this.setState({showCopied: false}), 2000);
    }

    toggleGranularityDropdown() {
        this.setState({granularityDropdownOpen: !this.state.granularityDropdownOpen});
    }

    updateGranularity(granularity) {
        this.setState({granularityDropdownOpen: false, activeGranularity: granularity});

        this.fetchTrends(this.state.startDateTime, this.state.endDateTime, granularity);
        event.preventDefault();
    }

    fetchTrends(from, until, granularity) {
        const query = {
            granularity: granularity.value,
            from,
            until
        };

        this.props.trendsSearchStore.fetchTrendOperationResults(this.props.serviceName, this.props.opName, query);
    }

    handlePresetSelection(preset) {
        const updatedGranularity = timeWindow.getLowerGranularity(preset.value);

        this.setState({
            activeWindow: preset,
            activeGranularity: updatedGranularity
        });

        const timeRange = timeWindow.toTimeRange(preset.value);

        this.fetchTrends(timeRange.from, timeRange.until, updatedGranularity);
    }

    handleCustomSelection() {
        const updatedGranularity = timeWindow.getLowerGranularity(this.state.endDateTime - this.state.startDateTime);

        this.setState({
            showCustomTimeRangePicker: false,
            activeWindow: 'CUSTOM',
            activeGranularity: updatedGranularity
        });

        this.fetchTrends(this.state.startDateTime, this.state.endDateTime, updatedGranularity);
    }

    handleCustomTimeRangePicker() {
        this.setState({showCustomTimeRangePicker: !this.state.showCustomTimeRangePicker});
    }

    handleChangeStartDate(value) {
        this.setState({startDateTime: moment(value).valueOf()});
    }

    handleChangeEndDate(value) {
        this.setState({endDateTime: moment(value).valueOf()});
    }

    toValid(current) {
        return current > moment(this.state.startDateTime).subtract(1, 'day') && current < DateTime.moment();
    }

    render() {
        const PresetOption = ({preset}) => (
            <button
                className={preset.shortName === this.state.activeWindow.shortName ? 'btn btn-primary' : 'btn btn-default'}
                key={preset.value}
                onClick={() => this.handlePresetSelection(preset)}
            >
                {preset.shortName}
            </button>
        );

        function getCustomTimeRangeText(startTime, endTime) {
            const start = moment(parseInt(startTime, 10));
            const end = moment(parseInt(endTime, 10));
            return `${start.format('L')} ${start.format('LT')} - ${end.format('L')} ${end.format('LT')}`;
        }

        function fromValid(current) {
            return current.isBefore(DateTime.moment());
        }

        return (
            <div className="trend-details-toolbar clearfix">
                <div className="pull-left trend-details-toolbar__time-range">
                    <div className="">Time Range</div>
                    <div className="btn-group btn-group-sm">
                        {timeWindow.presets.map(preset => (
                            <PresetOption
                                preset={preset}
                                key={preset.shortName}
                            />))}
                        <button
                            className={this.state.activeWindow === 'CUSTOM' ? 'btn btn-primary' : 'btn btn-default'}
                            type="button"
                            onClick={this.handleCustomTimeRangePicker}
                        >
                            {this.state.activeWindow === 'CUSTOM' ? getCustomTimeRangeText(this.state.startDateTime, this.state.endDateTime) : 'CUSTOM'}
                        </button>
                    </div>
                    { this.state.showCustomTimeRangePicker
                        ? <div className="custom-timerange-picker">
                            <div className="form-group">
                                <div>From :</div>
                                <DateTime
                                    className="custom-timerange-picker__datetime"
                                    isValidDate={fromValid}
                                    value={this.state.startDateTime}
                                    onChange={this.handleChangeStartDate}
                                />
                                <div>To :</div>
                                <DateTime
                                    className="custom-timerange-picker__datetime"
                                    isValidDate={this.toValid}
                                    value={this.state.endDateTime}
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
                        : null }
                </div>
                <div className="pull-left">
                    <div className="">Metric Granularity</div>
                    <div className={this.state.granularityDropdownOpen ? 'dropdown open' : 'dropdown'}>
                        <button
                            className="btn btn-sm btn-default dropdown-toggle"
                            onClick={() => this.toggleGranularityDropdown()}
                        >
                            <span>{this.state.activeGranularity.shortName}</span>
                            <span className="caret"/>
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                            <li>
                                {metricGranularity.options.map(option => (
                                    <a
                                        tabIndex={-1}
                                        key={option.shortName}
                                        role="button"
                                        onClick={() => this.updateGranularity(option)}
                                    >{option.shortName}</a>))}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pull-right btn-group btn-group-sm">
                    {
                        this.state.showCopied ? (
                            <span className="tooltip fade left in" role="tooltip">
                                    <span className="tooltip-arrow"/>
                                    <span className="tooltip-inner">Link Copied!</span>
                                </span>
                        ) : null
                    }
                    <Link
                        role="button"
                        className="btn btn-sm btn-default"
                        to={`/service/${this.props.serviceName}/traces?timePreset=${this.state.activeWindow.shortName}`}
                    ><span
                        className="ti-line-double"
                    /> See Traces</Link>
                    <Clipboard
                        text={`${window.location.protocol}//${window.location.host}${this.props.location.pathname}?operationName=${this.props.opName}`}
                        onCopy={this.handleCopy}
                    >
                        <a role="button" className="btn btn-sm btn-primary"><span className="ti-link"/> Share Trend</a>
                    </Clipboard>
                </div>
            </div>
        );
    }
}
