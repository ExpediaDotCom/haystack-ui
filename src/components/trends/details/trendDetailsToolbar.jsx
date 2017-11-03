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
import timeWindow from '../utils/timeWindow';
import metricGranularity from '../utils/metricGranularity';
import {toQuery} from '../../../utils/queryParser';

import './trendDetailsToolbar.less';
import TrendTimeRangePicker from './trendTimeRangePicker';

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
        this.handleCustomTimeRangePicker = this.handleCustomTimeRangePicker.bind(this);
        this.customTimeRangeChangeCallback = this.customTimeRangeChangeCallback.bind(this);

        const queryParams = toQuery(this.props.location.search);
        const from = queryParams.from;
        const until = queryParams.until;
        const activeWindow = from && until
            ? timeWindow.toCustomTimeRange(from, until)
            : timeWindow.findMatchingPreset(props.trendsSearchStore.serviceQuery.until - props.trendsSearchStore.serviceQuery.from);
        const activeGranularity = timeWindow.getLowerGranularity(activeWindow.value);

        this.state = {
            activeWindow,
            activeGranularity,
            granularityDropdownOpen: false,
            isPresetActive: !(from && until),
            showCustomTimeRangePicker: false,
            customTimeRangePickerText: from && until ? timeWindow.getCustomTimeRangeText(from, until) : 'custom'
        };
    }

    componentDidMount() {
        const timeRange = timeWindow.toTimeRange(this.state.activeWindow.value);
        const query = {
            granularity: this.state.activeGranularity.value,
            from: this.state.activeWindow.from || timeRange.from,
            until: this.state.activeWindow.until || timeRange.until
        };
        this.props.trendsSearchStore.fetchTrendOperationResults(this.props.serviceName, this.props.opName, query);
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
        this.fetchTrends(this.state.activeWindow, granularity);
        event.preventDefault();
    }

    fetchTrends(window, granularity) {
        const timeRange = timeWindow.toTimeRange(window.value);

        const query = {
            granularity: granularity.value,
            from: timeRange.from,
            until: timeRange.until
        };

        this.props.trendsSearchStore.fetchTrendOperationResults(this.props.serviceName, this.props.opName, query);
    }

    handlePresetSelection(preset) {
        const updatedGranularity = timeWindow.getLowerGranularity(preset.value);
        const timeRange = timeWindow.toTimeRange(preset.value);

        const presetWindow = preset;
        presetWindow.from = timeRange.from;
        presetWindow.until = timeRange.until;

        this.setState({
            activeWindow: presetWindow,
            isPresetActive: true,
            showCustomTimeRangePicker: false,
            activeGranularity: updatedGranularity,
            customTimeRangePickerText: 'custom'
        });

        this.fetchTrends(preset, updatedGranularity);
    }

    handleCustomTimeRangePicker() {
        this.setState({showCustomTimeRangePicker: !this.state.showCustomTimeRangePicker});
    }

    customTimeRangeChangeCallback(activeWindow) {
        const updatedGranularity = timeWindow.getLowerGranularity(activeWindow.value);

        this.setState({
            activeWindow,
            showCustomTimeRangePicker: false,
            isPresetActive: false,
            activeGranularity: updatedGranularity,
            customTimeRangePickerText: timeWindow.getCustomTimeRangeText(activeWindow.from, activeWindow.until)
        });

        this.fetchTrends(activeWindow, updatedGranularity);
    }

    render() {
        const PresetOption = ({preset}) => (
            <button
                className={preset.shortName === this.state.activeWindow.shortName && this.state.isPresetActive ? 'btn btn-primary' : 'btn btn-default'}
                key={preset.value}
                onClick={() => this.handlePresetSelection(preset)}
            >
                {preset.shortName}
            </button>
        );

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
                            className={this.state.isPresetActive ? 'btn btn-default' : 'btn btn-primary'}
                            type="button"
                            onClick={this.handleCustomTimeRangePicker}
                        >
                            {this.state.customTimeRangePickerText}
                        </button>
                    </div>

                    { this.state.showCustomTimeRangePicker
                        ? <TrendTimeRangePicker customTimeRangeChangeCallback={this.customTimeRangeChangeCallback} activeWindow={this.state.activeWindow}/>
                        : null
                    }
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
                        text={`${window.location.protocol}//${window.location.host}${this.props.location.pathname}?operationName=${this.props.opName}&from=${this.state.activeWindow.from ||
                        timeWindow.toTimeRange(this.state.activeWindow.value).from}&until=${this.state.activeWindow.until ||
                        timeWindow.toTimeRange(this.state.activeWindow.value).until}`}
                        onCopy={this.handleCopy}
                    >
                        <a role="button" className="btn btn-sm btn-primary"><span className="ti-link"/> Share Trend</a>
                    </Clipboard>
                </div>
            </div>
        );
    }
}
