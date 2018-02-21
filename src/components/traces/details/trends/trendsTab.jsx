/* eslint-disable react/prefer-stateless-function */
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

import ServiceOperationTrendRow from './serviceOperationTrendRow';

export default class extends React.Component {
    static propTypes = {
        timelineSpans: PropTypes.array.isRequired,
        from: PropTypes.number.isRequired,
        until: PropTypes.number.isRequired
    };

    render() {
        const {timelineSpans, from, until} = this.props;

        const serviceOperationList = _.uniqWith(timelineSpans.map(span => ({
            serviceName: span.serviceName,
            operationName: span.operationName
        })),
        _.isEqual);

        return (
            <article>
                <div className="text-right">
                    <span>Trace trends for </span>
                    <select className="time-range-selector" value="1h">
                        <option key="1h" value="1h">last 1 hour</option>
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
                            <ServiceOperationTrendRow serviceName={serviceOp.serviceName} operationName={serviceOp.operationName} from={from} until={until} />
                        ))
                    }
                    </tbody>
                </table>
            </article>
        );
    }
}
