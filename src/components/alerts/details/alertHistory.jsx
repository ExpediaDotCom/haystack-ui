/*
 * Copyright 2018 Expedia Group
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
import linkBuilder from '../../../utils/linkBuilder';

const tracesEnabled = window.haystackUiConfig.subsystems.includes('traces');

@observer
export default class AlertHistory extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired,
        historyWindow: PropTypes.number.isRequired
    };

    static timeAgoFormatter(cell) {
        return formatters.toTimeago(cell * 1000);
    }

    static timestampFormatter(cell) {
        return formatters.toTimestring(cell * 1000);
    }

    static durationColumnFormatter(start, end) {
        return formatters.toDurationStringInSecAndMin(end - start);
    }

    static timeBufferAroundAlert = 10 * 60 * 1000; // 10 mins

    constructor(props) {
        super(props);

        this.trendLinkCreator = this.trendLinkCreator.bind(this);
        this.traceLinkCreator = this.traceLinkCreator.bind(this);
    }

    trendLinkCreator(timestamp) {
        const from = (timestamp) - AlertHistory.timeBufferAroundAlert;
        const to = (timestamp) + AlertHistory.timeBufferAroundAlert;

        return linkBuilder.universalSearchTrendsLink({
            serviceName: this.props.serviceName,
            operationName: this.props.operationName,
            time: {
                from,
                to
            }
        });
    }

    traceLinkCreator(timestamp) {
        const from = (timestamp) - AlertHistory.timeBufferAroundAlert;
        const to = (timestamp) + AlertHistory.timeBufferAroundAlert;

        return linkBuilder.universalSearchTracesLink({
            serviceName: this.props.serviceName,
            operationName: this.props.operationName,
            time: {
                from,
                to
            }
        });
    }

    render() {
        const sortedHistoryResults = _.orderBy(this.props.alertDetailsStore.alertHistory, alert => alert.timestamp, ['desc']);

        return (
            <div className="col-md-6 alert-history">
                <header>
                    <h4>History
                        <span className="h6"> ({sortedHistoryResults.length} times unhealthy in last {this.props.historyWindow / 86400000} day)</span>
                    </h4>

                </header>
                <table className="table">
                    <thead>
                    <tr>
                        <th width="40%">Timestamp</th>
                        <th width="20%" className="text-right">Observed Value</th>
                        <th width="20%" className="text-right">Expected Value</th>
                        <th width="20%" className="text-right">{tracesEnabled ? 'Trends & Traces' : 'Trends'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedHistoryResults.length ? sortedHistoryResults.map(alert =>
                            (<tr className="non-highlight-row" key={Math.random()}>
                                <td><span className="alerts__bold">{AlertHistory.timeAgoFormatter(alert.timestamp * 1000)}</span> at {AlertHistory.timestampFormatter(alert.timestamp * 1000)}</td>
                                <td className="text-right"><span className="alerts__bold">{alert.observedvalue}</span></td>
                                <td className="text-right"><span className="alerts__bold">{alert.expectedvalue}</span></td>
                                <td className="text-right">
                                    <div className="btn-group btn-group-sm">
                                        <Link to={this.trendLinkCreator(alert.timestamp * 1000)} target="_blank" className="btn btn-default">
                                            <span className="ti-stats-up"/>
                                        </Link>
                                        {   tracesEnabled &&
                                            <Link to={this.traceLinkCreator(alert.timestamp * 1000)} target="_blank" className="btn btn-sm btn-default">
                                                <span className="ti-align-left"/>
                                            </Link>
                                        }
                                    </div>
                                </td>
                            </tr>))
                        : (<tr className="non-highlight-row"><td>No past alert found</td><td/><td/></tr>)
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}
