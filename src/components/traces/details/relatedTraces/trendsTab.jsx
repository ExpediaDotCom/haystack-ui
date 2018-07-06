/* eslint-disable react/prefer-stateless-function */
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
import _ from 'lodash';

import timeWindow from '../../../../utils/timeWindow';
import ServiceOperationTrendRow from './serviceOperationTrendRow';

export default class trendsTab extends React.Component {
    static propTypes = {
        timelineSpans: PropTypes.array.isRequired,
        isUniversalSearch: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        const from = Date.now() - (60 * 60 * 1000);
        const until = Date.now();
        const selectedIndex = timeWindow.presets.indexOf(timeWindow.defaultPreset);
        this.state = {
            from,
            until,
            selectedIndex
        };

        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    handleTimeChange(event) {
        const selectedIndex = event.target.value;
        const selectedWindow = timeWindow.presets[selectedIndex];
        const selectedTimeRange = timeWindow.toTimeRange(selectedWindow.value);
        this.setState({
            from: selectedTimeRange.from,
            until: selectedTimeRange.until,
            selectedIndex
        });
    }

    render() {
        const {timelineSpans, isUniversalSearch} = this.props;
        const {selectedIndex, from, until} = this.state;
        const selectedPreset = timeWindow.presets[selectedIndex];
        const granularity = timeWindow.getLowerGranularity(selectedPreset.value).value;

        const serviceOperationList = _.uniqWith(timelineSpans.map(span => ({
                serviceName: span.serviceName,
                operationName: span.operationName
            })),
            _.isEqual);

        return (
            <article>
                <div className="text-right">
                    <span>Trace trends for </span>
                    <select className="time-range-selector" value={selectedIndex} onChange={this.handleTimeChange}>
                        {timeWindow.presets.map((window, index) => (
                            <option
                                key={window.longName}
                                value={index}
                            >{window.isCustomTimeRange ? '' : 'last'} {window.longName}</option>))}
                    </select>
                </div>
                <table className="trace-trend-table">
                    <thead className="trace-trend-table_header">
                    <tr>
                        <th width="60" className="trace-trend-table_cell">Operation</th>
                        <th width="20" className="trace-trend-table_cell text-right">Count</th>
                        <th width="20" className="trace-trend-table_cell text-right">Duration</th>
                        <th width="20" className="trace-trend-table_cell text-right">Success %</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        serviceOperationList.map(serviceOp => (
                            <ServiceOperationTrendRow
                                serviceName={serviceOp.serviceName}
                                operationName={serviceOp.operationName}
                                granularity={granularity}
                                from={from}
                                until={until}
                                isUniversalSearch={isUniversalSearch}
                            />
                        ))
                    }
                    </tbody>
                </table>
            </article>
        );
    }
}
