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

export default class extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired
    };

    componentWillMount() {
        fetcher.fetchOperationTrends(this.props.serviceName, this.props.serviceName.operationName, Date.now() - (60 * 60 * 1000), Date.now())
        .then((result) => {
            this.setState({trends: result.data});
        });
    }

    render() {
        const {serviceName, operationName} = this.props;
        const trends = this.state && this.state.trends;
        const totalCount = trends && _.sum(trends.count.map(a => a.value));
        return (
            <tr>
                <td className="trace-trend-table_cell">
                    <a href="http://localhost:8080/service/expweb/trends?operationName=service%3AUserServiceV3-AuthenticateByAutologin&from=1518791107653&until=1518794707653">
                    <div className={`service-spans label label-default ${colorMapper.toBackgroundClass(serviceName)}`}>
                        {serviceName}
                    </div>
                    <div className="trace-trend-table_op-name">{operationName}</div>
                    </a>
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
