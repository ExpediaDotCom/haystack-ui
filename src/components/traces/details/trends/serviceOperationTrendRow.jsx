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
import _ from 'lodash';

import colorMapper from '../../../../utils/serviceColorMapper';
import TrendsTableFormatters from '../../../trends/utils/trendsTableFormatters';
import fetcher from '../../stores/traceTrendFetcher';

export default class TrendRow extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired,
        from: PropTypes.number.isRequired,
        until: PropTypes.number.isRequired
    };

    static openTrendDetailInNewTab(serviceName, operationName, from, until) {
        const tab = window.open(`/service/${serviceName}/trends?operationName=${encodeURIComponent(operationName)}&from=${from}&until=${until}`, '_blank');
        tab.focus();
    }

    componentWillMount() {
        fetcher.fetchOperationTrends(this.props.serviceName, this.props.operationName, this.props.from, this.props.until)
        .then((result) => {
            this.setState({trends: result});
        });
    }

    render() {
        const {serviceName, operationName, from, until} = this.props;
        const trends = this.state && this.state.trends;
        const totalCount = trends && _.sum(trends.count.map(a => a.value));

        return (
            <tr onClick={() => TrendRow.openTrendDetailInNewTab(serviceName, operationName, from, until)}>
                <td className="trace-trend-table_cell">
                    <div className={`service-spans label label-default ${colorMapper.toBackgroundClass(serviceName)}`}>{serviceName}</div>
                    <div className="trace-trend-table_op-name">{operationName}</div>
                </td>
                <td className="trace-trend-table_cell">
                    {trends && TrendsTableFormatters.countColumnFormatter(totalCount, {countPoints: trends.count})}
                </td>
                <td className="trace-trend-table_cell">
                    {trends && TrendsTableFormatters.durationColumnFormatter(trends.tp99Duration[trends.tp99Duration.length - 1].value / 100, {tp99DurationPoints: trends.tp99Duration})}
                </td>
                <td className="trace-trend-table_cell">
                    {trends && TrendsTableFormatters.successPercentFormatter(100, {successPercentPoints: trends.successCount.map(() => ({value: 100}))})}
                </td>
            </tr>
        );
    }
}
