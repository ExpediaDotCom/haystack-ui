/*
 * Copyright 2018 Expedia Group
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
import ReactGA from 'react-ga';

import timeWindow from '../../utils/timeWindow';
import {toQuery, toQueryUrlString} from '../../utils/queryParser';

import './trendsHeader.less';

export default class TrendsHeader extends React.Component {
    static propTypes = {
        operationStore: PropTypes.object.isRequired,
        serviceStore: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    static createInitState(urlQuery) {
        const from = parseInt(urlQuery.from, 10);
        const until = parseInt(urlQuery.until, 10);
        const isCustomTimeRange = !!(from && until);

        let activeWindow;
        let options;
        if (isCustomTimeRange) {
            activeWindow = timeWindow.toCustomTimeRange(from, until);
            options = [...timeWindow.presets, activeWindow];
        } else {
            activeWindow = timeWindow.findMatchingPresetByShortName(urlQuery.preset) || timeWindow.defaultPreset;
            const activeWindowTimeRange = timeWindow.toTimeRange(activeWindow.value);
            activeWindow.from = activeWindowTimeRange.from;
            activeWindow.until = activeWindowTimeRange.until;
            options = timeWindow.presets;
        }

        return {
            options,
            activeWindow
        };
    }

    static createInitFilters(urlQuery) {
        return {
            operationName: urlQuery.operationName && decodeURIComponent(urlQuery.operationName),
            gtSuccessPercent: urlQuery.gtSuccessPercent && decodeURIComponent(urlQuery.gtSuccessPercent),
            ltSuccessPercent: urlQuery.ltSuccessPercent && decodeURIComponent(urlQuery.ltSuccessPercent),
            gtCount: urlQuery.gtCount && decodeURIComponent(urlQuery.gtCount),
            ltCount: urlQuery.ltCount && decodeURIComponent(urlQuery.ltCount),
            gtTP99Count: urlQuery.gtTP99Count && decodeURIComponent(urlQuery.gtTP99Count),
            ltTP99Count: urlQuery.ltTP99Count && decodeURIComponent(urlQuery.ltTP99Count)
        };
    }

    static createFilterQuery(filters) {
        const urlQuery = {};

        const operationName = filters.operationName && filters.operationName.value;
        const gtCount = filters.totalCount && filters.totalCount.value.comparator === '>' ?
            filters.totalCount.value.number : null;
        const ltCount = filters.totalCount && filters.totalCount.value.comparator === '<' ?
            filters.totalCount.value.number : null;
        const gtTP99Count = filters.latestTp99Duration && filters.latestTp99Duration.value.comparator === '>' ?
            filters.latestTp99Duration.value.number : null;
        const ltTP99Count = filters.latestTp99Duration && filters.latestTp99Duration.value.comparator === '<' ?
            filters.latestTp99Duration.value.number : null;
        const gtSuccessPercent = filters.avgSuccessPercent && filters.avgSuccessPercent.value.comparator === '>' ?
            filters.avgSuccessPercent.value.number : null;
        const ltSuccessPercent = filters.avgSuccessPercent && filters.avgSuccessPercent.value.comparator === '<' ?
            filters.avgSuccessPercent.value.number : null;

        if (operationName) urlQuery.operationName = operationName;
        if (gtCount) urlQuery.gtCount = gtCount;
        if (ltCount) urlQuery.ltCount = ltCount;
        if (gtTP99Count) urlQuery.gtTP99Count = gtTP99Count;
        if (ltTP99Count) urlQuery.ltTP99Count = ltTP99Count;
        if (gtSuccessPercent) urlQuery.gtSuccessPercent = gtSuccessPercent;
        if (ltSuccessPercent) urlQuery.ltSuccessPercent = ltSuccessPercent;

        return urlQuery;
    }

    constructor(props) {
        super(props);

        this.fetchTrends = this.fetchTrends.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);

        const urlQuery = toQuery(this.props.location.search);
        const state = TrendsHeader.createInitState(urlQuery);

        this.fetchTrends(this.props.serviceName, state.activeWindow, TrendsHeader.createInitFilters(urlQuery));

        this.state = state;
    }

    componentWillReceiveProps(nextProps) {
        const urlQuery = toQuery(nextProps.location.search);
        const state = TrendsHeader.createInitState(urlQuery);

        this.fetchTrends(nextProps.serviceName, state.activeWindow, TrendsHeader.createInitFilters(urlQuery));

        this.setState(state);
    }

    fetchTrends(serviceName, window, filters) {
        const granularity = timeWindow.getLowerGranularity(window.value);

        const query = {
            granularity: granularity.value,
            from: window.from,
            until: window.until
        };
        this.props.serviceStore.fetchStats(serviceName, query, !!(window.isCustomTimeRange));
        this.props.operationStore.fetchStats(serviceName, query, !!(window.isCustomTimeRange), filters);
    }

    handleTimeChange(event) {
        const selectedIndex = event.target.value;
        const selectedWindow = this.state.options[selectedIndex];

        this.fetchTrends(this.props.serviceName, selectedWindow, null);

        let query = {};
        if (selectedWindow.isCustomTimeRange) {
            query = {
                from: selectedWindow.from,
                until: selectedWindow.until,
                preset: selectedWindow.shortName
            };
        } else {
            query = {
                preset: selectedWindow.shortName
            };
        }

        const queryUrl = `?${toQueryUrlString({
            ...query, 
            ...TrendsHeader.createFilterQuery(this.props.operationStore.statsQuery.filters)
        })}`;
        // push to history only if it is not the same search as the current one
        if (queryUrl !== this.props.location.search) {
            this.props.history.push({
                search: queryUrl
            });
        }

        ReactGA.event({
            category: 'Trend Summary',
            action: 'summary change',
            label: `changed to ${selectedWindow.shortName || selectedWindow.longName}`
        });
    }

    render() {
        const {
            options,
            activeWindow
        } = this.state;

        const selectedIndex = options.indexOf(activeWindow);

        return (
                <div className="pull-right trend-summary__header-text">
                    <span>Service trends for </span>
                    <select className="time-range-selector" value={selectedIndex} onChange={this.handleTimeChange}>
                        {options.map((window, index) => (<option key={window.longName} value={index}>{window.isCustomTimeRange ? '' : 'last'} {window.longName}</option>))}
                    </select>
                </div>
        );
    }
}
