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
import Clipboard from 'react-copy-to-clipboard';
import {Link} from 'react-router-dom';
import timeWindow from '../../../utils/timeWindow';
import metricGranularity from '../utils/metricGranularity';

import './trendDetailsToolbar.less';
import TimeRangeWindow from '../../common/timeRangeWindow';

export default class TrendDetailsToolbar extends React.Component {

    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        trendsStore: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        opName: PropTypes.string,
        statsType: PropTypes.string,
        serviceSummary: PropTypes.bool.isRequired
    };

    static defaultProps = {
        opName: null,
        statsType: null
    };

    constructor(props) {
        super(props);

        this.setTimeWindowWrapperRef = this.setTimeWindowWrapperRef.bind(this);
        this.hideTimePicker = this.hideTimePicker.bind(this);
        this.showTimePicker = this.showTimePicker.bind(this);
        this.handleTimeWindowOutsideClick = this.handleTimeWindowOutsideClick.bind(this);
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.fetchTrends = this.fetchTrends.bind(this);
        this.handleGranularityDropdownOutsideClick = this.handleGranularityDropdownOutsideClick.bind(this);
        this.toggleGranularityDropdown = this.toggleGranularityDropdown.bind(this);
        this.hideGranularityDropdown = this.hideGranularityDropdown.bind(this);
        this.showGranularityDropdown = this.showGranularityDropdown.bind(this);
        this.updateGranularity = this.updateGranularity.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.customTimeRangeChangeCallback = this.customTimeRangeChangeCallback.bind(this);
        this.setClipboardText = this.setClipboardText.bind(this);
        this.setGranularityWrapperRef = this.setGranularityWrapperRef.bind(this);

        const {
            from,
            until,
            isCustomTimeRange
        } = props.trendsStore.statsQuery;

        const activeWindow = isCustomTimeRange
            ? timeWindow.toCustomTimeRange(from, until)
            : timeWindow.findMatchingPreset(until - from);
        const activeGranularity = timeWindow.getLowerGranularity(activeWindow.value);

        this.state = {
            activeWindow,
            activeGranularity,
            granularityDropdownOpen: false,
            showCustomTimeRangePicker: false,
            clipboardText: this.setClipboardText(activeWindow)
        };
    }

    componentDidMount() {
        this.fetchTrends(this.state.activeWindow, this.state.activeGranularity);
    }

    setGranularityWrapperRef(node) {
        this.granularityWrapperRef = node;
    }

    setTimeWindowWrapperRef(node) {
        this.timeWindowWrapperRef = node;
    }

    setClipboardText(activeWindow) {
        if (this.props.serviceSummary === true) {
            return `${window.location.protocol}//${window.location.host}${this.props.location.pathname}?from=${activeWindow.from ||
            timeWindow.toTimeRange(activeWindow.value).from}&until=${activeWindow.until ||
            timeWindow.toTimeRange(activeWindow.value).until}`;
        }
        return `${window.location.protocol}//${window.location.host}${this.props.location.pathname}?operationName=^${encodeURIComponent(this.props.opName)}$&from=${activeWindow.from ||
        timeWindow.toTimeRange(activeWindow.value).from}&until=${activeWindow.until ||
        timeWindow.toTimeRange(activeWindow.value).until}`;
    }

    hideTimePicker() {
        document.removeEventListener('mousedown', this.handleTimeWindowOutsideClick);
        this.setState({showCustomTimeRangePicker: false});
    }

    showTimePicker() {
        document.addEventListener('mousedown', this.handleTimeWindowOutsideClick);
        this.setState({showCustomTimeRangePicker: true});
    }


    handleTimeWindowOutsideClick(e) {
        if (this.timeWindowWrapperRef && !this.timeWindowWrapperRef.contains(e.target)) {
            this.hideTimePicker();
        }
    }

    handleCopy() {
        this.setState({showCopied: true});
        setTimeout(() => this.setState({showCopied: false}), 2000);
    }

    handleGranularityDropdownOutsideClick(e) {
        if (this.granularityWrapperRef && !this.granularityWrapperRef.contains(e.target)) {
            this.hideGranularityDropdown();
        }
    }

    toggleGranularityDropdown() {
        if (this.state.granularityDropdownOpen) {
            this.hideGranularityDropdown();
        } else {
            this.showGranularityDropdown();
        }
    }

    hideGranularityDropdown() {
        document.addEventListener('mousedown', this.handleGranularityDropdownOutsideClick);
        this.setState({granularityDropdownOpen: false});
    }

    showGranularityDropdown() {
        document.addEventListener('mousedown', this.handleGranularityDropdownOutsideClick);
        this.setState({granularityDropdownOpen: true});
    }

    updateGranularity(granularity) {
        this.hideGranularityDropdown();
        this.setState({activeGranularity: granularity});
        this.fetchTrends(this.state.activeWindow, granularity);
    }

    fetchTrends(window, granularity) {
        const query = {
            granularity: granularity.value,
            from: window.from,
            until: window.until
        };


        if (this.props.opName) {
            this.props.trendsStore.fetchTrends(this.props.serviceName, this.props.opName, query);
        } else {
            this.props.trendsStore.fetchTrends(this.props.serviceName, this.props.statsType, query);
        }
    }

    handlePresetSelection(preset) {
        const updatedGranularity = timeWindow.getLowerGranularity(preset.value);
        const timeRange = timeWindow.toTimeRange(preset.value);

        const presetWindow = preset;
        presetWindow.from = timeRange.from;
        presetWindow.until = timeRange.until;
        this.hideTimePicker();
        this.setState({
            clipboardText: this.setClipboardText(preset),
            activeWindow: presetWindow,
            activeGranularity: updatedGranularity
        });

        this.fetchTrends(preset, updatedGranularity);
    }

    customTimeRangeChangeCallback(updatedWindow) {
        const activeWindow = timeWindow.toCustomTimeRange(updatedWindow.from, updatedWindow.to);
        const updatedGranularity = timeWindow.getLowerGranularity(activeWindow.value);
        this.hideTimePicker();
        this.setState({
            clipboardText: this.setClipboardText(activeWindow),
            activeWindow,
            activeGranularity: updatedGranularity
        });

        this.fetchTrends(activeWindow, updatedGranularity);
    }

    render() {
        const PresetOption = ({preset}) => (
            <button
                className={preset === this.state.activeWindow ? 'btn btn-primary' : 'btn btn-default'}
                key={preset.value}
                onClick={() => this.handlePresetSelection(preset)}
            >
                {preset.shortName}
            </button>
        );

        return (
            <div className="trend-details-toolbar clearfix">
                <div className="pull-left trend-details-toolbar__time-range">
                    <div>Time Range</div>
                    <div ref={this.setTimeWindowWrapperRef}>
                        <div className="btn-group btn-group-sm">
                            {timeWindow.presets.map(preset => (
                                <PresetOption
                                    preset={preset}
                                    key={preset.shortName}
                                />))}
                            <button
                                className={this.state.activeWindow.isCustomTimeRange ? 'custom-btn btn btn-primary' : 'custom-btn btn btn-default'}
                                type="button"
                                onClick={this.state.showCustomTimeRangePicker ? this.hideTimePicker : this.showTimePicker}
                            >
                                {this.state.activeWindow.isCustomTimeRange ? this.state.activeWindow.longName : 'custom'}
                            </button>
                        </div>
                        { this.state.showCustomTimeRangePicker
                            ? <TimeRangeWindow
                                className="trend-timerange-picker"
                                customTimeRangeChangeCallback={this.customTimeRangeChangeCallback}
                            />
                            : null
                        }
                    </div>
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
                        <ul ref={this.setGranularityWrapperRef} className="dropdown-menu" aria-labelledby="dropdownMenu1">
                            <li>
                                {metricGranularity.options.map(option => (
                                    <a
                                        className="granularity-button"
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
                        this.state.showCopied && (
                            <span className="tooltip fade left in" role="tooltip">
                                    <span className="tooltip-arrow"/>
                                    <span className="tooltip-inner">Link Copied!</span>
                                </span>
                        )
                    }
                    {
                        this.props.serviceSummary === false && (
                            <Link
                                role="button"
                                className="btn btn-sm btn-default"
                                to={`/service/${this.props.serviceName}/traces?serviceName=${this.props.serviceName}&operationName=${this.props.opName}&startTime=${this.state.activeWindow.from}&endTime=${this.state.activeWindow.until}`}
                            ><span
                                className="ti-align-left"
                            /> See Traces</Link>

                        )
                    }
                    <a
                        role="button"
                        className="btn btn-sm btn-default"
                        target="_blank"
                        href={this.state.clipboardText}
                    ><span
                        className="ti-new-window"
                    /> Open in new tab</a>

                    <Clipboard
                        text={this.state.clipboardText}
                        onCopy={this.handleCopy}
                    >
                        <a role="button" className="btn btn-sm btn-primary"><span className="ti-link"/> Share Trend</a>
                    </Clipboard>
                </div>
            </div>
        );
    }
}
