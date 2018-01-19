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
import {observer} from 'mobx-react';
import _ from 'lodash';
import {Link} from 'react-router-dom';

import formatters from '../../../utils/formatters';

@observer
export default class AlertDetailsContainer extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    static timeAgoFormatter(cell) {
        return formatters.toTimeago(cell);
    }

    static timestampFormatter(cell) {
        return formatters.toTimestring(cell);
    }

    static durationColumnFormatter(start, end) {
        return formatters.toDurationString(end - start);
    }

    constructor(props) {
        super(props);

        this.trendLinkCreator = this.trendLinkCreator.bind(this);
        this.traceLinkCreator = this.traceLinkCreator.bind(this);
    }

    trendLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/trends?operationName=${this.props.operationName}&from=${startTimestamp / 1000}&until=${endTimestamp / 1000}`;
    }

    traceLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/traces?operationName=${this.props.operationName}&startTime=${startTimestamp / 1000}&endTime=${endTimestamp / 1000}`;
    }

    render() {
        const sortedResults = _.orderBy(this.props.alertDetailsStore.alertDetails, alert => alert.startTimestamp, ['desc']);

        return (
            <div className="clearfix alert-details-container">
                <table className="alert-details__table table table-striped">
                    <thead>
                    <tr>
                        <th>Start Time</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedResults.map(alert =>
                        (<tr className="history-row" key={Math.random()}>
                            <td><span className="alerts__bold">{AlertDetailsContainer.timeAgoFormatter(alert.startTimestamp)}</span> at {AlertDetailsContainer.timestampFormatter(alert.startTimestamp)}</td>
                            <td><span className="alerts__bold">{AlertDetailsContainer.durationColumnFormatter(alert.startTimestamp, alert.endTimestamp)}</span></td>
                            <td>
                                <Link
                                    to={this.trendLinkCreator(alert.startTimestamp, alert.endTimestamp)}
                                    className="no-underline"
                                >
                                    <span className="ti-stats-up"/>  Trends
                                </Link>
                                <Link
                                    to={this.traceLinkCreator(alert.startTimestamp, alert.endTimestamp)}
                                    className="alert-details__button-margin no-underline"
                                >
                                    <span className="ti-line-double"/>  Traces
                                </Link>
                            </td>
                        </tr>)
                    )}
                    </tbody>
                </table>
            </div>
        );
    }

}
