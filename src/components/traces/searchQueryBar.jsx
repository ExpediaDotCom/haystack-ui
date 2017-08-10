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
import TimeRangePicker from './timeRangePicker';
import {dateIsValid, queryIsValid, parseQueryString, toQueryString} from './utils/traceQueryParser';
import toPresetDisplayText from './utils/presets';
import './searchBar.less';

export default class SearchQueryBar extends React.Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        searchCallback: PropTypes.func.isRequired
    }

    static getTimeRangeText(timePreset, startTime, endTime) {
        if (timePreset) {
            return toPresetDisplayText(timePreset);
        }

        const start = moment(parseInt(startTime, 10));
        const end = moment(parseInt(endTime, 10));
        return `${start.format('L')} ${start.format('LTS')} - ${end.format('L')} ${end.format('LTS')}`;
    }

    static createStateUsingQuery(query) {
        return {
            queryString: toQueryString(query),
            showTimeRangePicker: false,
            queryError: false,
            dateError: false,
            timePreset: query.timePreset,
            startTime: query.startTime,
            endTime: query.endTime,
            timeRangePickerToggleText: SearchQueryBar.getTimeRangeText(query.timePreset, query.startTime, query.endTime)
        };
    }

    constructor(props) {
        super(props);

        this.state = SearchQueryBar.createStateUsingQuery(props.query);

        this.handleQueryStringChange = this.handleQueryStringChange.bind(this);
        this.handleTimeRangePicker = this.handleTimeRangePicker.bind(this);
        this.handleTimeRangeSelect = this.handleTimeRangeSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.timeRangeChangeCallback = this.timeRangeChangeCallback.bind(this);
        this.isSearchValid = this.isSearchValid.bind(this);
        this.search = this.search.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(SearchQueryBar.createStateUsingQuery(nextProps.query));
    }

    handleQueryStringChange(event) {
        this.setState({queryString: event.target.value});
    }

    handleTimeRangePicker() {
        if (this.state.showTimeRangePicker) {
            this.setState({showTimeRangePicker: false});
        } else {
            this.setState({showTimeRangePicker: true});
        }
    }

    handleTimeRangeSelect(timeRange, optionType) {
        this.setState({
            timeRangeSelected: timeRange,
            timeRangeType: optionType
        });
    }

    handleSubmit(event) {
        this.search();
        event.preventDefault();
    }

    isSearchValid() {
        const queryValid = queryIsValid(this.state.queryString);
        const dateValid = dateIsValid(this.state.startTime, this.state.endTime);
        this.setState({queryError: !queryValid});
        this.setState({dateError: !dateValid});

        return queryValid && dateValid;
    }

    timeRangeChangeCallback(timePreset, startTime, endTime) {
        this.setState({timePreset, startTime, endTime});
        this.setState({timeRangePickerToggleText: SearchQueryBar.getTimeRangeText(timePreset, startTime, endTime)});
        this.setState({showTimeRangePicker: false});
    }

    search() {
        if (this.isSearchValid()) {
            const query = parseQueryString(this.state.queryString);
            query.timePreset = this.state.timePreset;
            query.startTime = this.state.startTime;
            query.endTime = this.state.endTime;

            this.props.searchCallback(query);
        }
    }

    render() {
        return (
            <section className="search-query-bar">
                <div>
                <form className="input-group input-group-lg" onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        className="search-bar-text-box form-control"
                        placeholder="enter query..."
                        value={this.state.queryString}
                        onChange={this.handleQueryStringChange}
                    />
                    <span className="input-group-btn">
                        <button
                            className="btn btn-primary time-range-picker-toggle"
                            type="button"
                            onClick={this.handleTimeRangePicker}
                        >
                            {this.state.timeRangePickerToggleText}
                        </button>
                    </span>
                    <span className="input-group-btn">
                        <button className="btn btn-primary traces-search-button" type="button" onClick={this.search}>
                            <span className="ti-search"/>
                        </button>
                    </span>
                </form>
                { this.state.showTimeRangePicker
                    ? <TimeRangePicker timeRangeChangeCallback={this.timeRangeChangeCallback}/>
                    : null }
                </div>
                { this.state.queryError ? <p className="traces-error-message">Please make sure your keys have values and are separated by a space</p> : null}
                { this.state.dateError ? <p className="traces-error-message traces-date-error">Invalid Date</p> : null}
            </section>
        );
    }
}
