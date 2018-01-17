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
import {Link} from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import formatters from '../../../utils/formatters';

@observer
export default class AlertDetailsContainer extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        row: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    static activeCheckbox(cell) {
        return `<input type="checkbox" checked=${cell} >`;
    }

    static timeAgoFormatter(cell) {
        return formatters.toTimeago(cell);
    }

    static timestampFormatter(cell) {
        return formatters.toTimestring(cell);
    }

    static activeDateFormatter(cell) {
        let dateString = '';
        const days = formatters.toActiveDateArray(cell);
        days.forEach((day) => {
            dateString += `<span class="badge alert-details__day-badge">${day}</span>`;
        });
        return dateString;
    }

    static activeTimeFormatter(cell) {
        const from = cell[0];
        const to = cell[1];
        return `${formatters.toTimeRegex(from)} to ${formatters.toTimeRegex(to)}`;
    }

    static durationColumnFormatter(cell, row) {
        return formatters.toDurationString(row.startTimestamp - row.endTimestamp);
    }

    static subscriptionDeleteButton() {
        return '<button class="btn btn-primary btn-sm"><span class="ti-trash" /></button>';
    }

    static subscriptionEditButton() {
        return '<button class="btn btn-success btn-sm"><span class="ti-pencil" /></button>';
    }

    render() {
        return (
            <div className="clearfix alert-details-container">
                {/* Subscription tool */}
                {/* <div className="alert-details__details-list"> */}
                    {/* <div className="title-button-group"> */}
                        {/* h5 className="alert-details__title">Subscriptions</h5> */}
                        {/* <button className="btn btn-sm btn-success pull-right alert-details__button">New Subscription</button> */}
                    {/* </div> */}
                    {/* <BootstrapTable data={this.props.alertDetailsStore.alertDetails.subscriptions} height={150} scrollTop={'Top'} > */}
                        {/* <TableHeaderColumn dataField="subscriptionId" isKey hidden>Target</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="10%" dataField="type">Type</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="30%" dataField="days" dataFormat={AlertDetailsContainer.activeDateFormatter} >Days Active</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="20%" dataField="time" dataFormat={AlertDetailsContainer.activeTimeFormatter} >Time</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="8%" dataField="enabled" dataFormat={AlertDetailsContainer.activeCheckbox} >Active</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="8%" dataField="delete" dataFormat={AlertDetailsContainer.subscriptionDeleteButton} /> */}
                        {/* <TableHeaderColumn width="8%" dataField="edit" dataFormat={AlertDetailsContainer.subscriptionEditButton} /> */}
                    {/* </BootstrapTable> */}
                {/* </div> */}
                <div className="alert-details__history-table">
                    <div className="title-button-group">
                        <h5 className="alert-details__title">Unhealthy Alert History</h5>
                        <div className="btn-group-sm alert-details__button new-button-spacing pull-right">
                            <Link
                                className="btn btn-sm btn-primary"
                                to={`/service/${this.props.serviceName}/trends?operationName=${encodeURIComponent(this.props.row.operationName)}`}
                            >
                                <span className="ti-stats-up"/> Trends
                            </Link>
                            <Link
                                role="button"
                                className="btn btn-sm btn-primary alert-details__button-margin"
                                to={`/service/${this.props.serviceName}/traces?serviceName=${this.props.serviceName}&operationName=${encodeURIComponent(this.props.row.operationName)}`}
                            >
                                <span className="ti-line-double"/> Traces
                            </Link>
                        </div>
                    </div>
                    <BootstrapTable data={this.props.alertDetailsStore.alertDetails.history} height={150} scrollTop={'Top'} options={{defaultSortName: 'startTimestamp', defaultSortOrder: 'desc'}}>
                        <TableHeaderColumn dataSort dataFormat={AlertDetailsContainer.timeAgoFormatter} dataField="startTimestamp" isKey>Time Alert Started</TableHeaderColumn>
                        <TableHeaderColumn dataSort dataFormat={AlertDetailsContainer.timestampFormatter} dataField="startTimestamp">Timestamp</TableHeaderColumn>
                        <TableHeaderColumn dataFormat={AlertDetailsContainer.durationColumnFormatter} dataField="endTimestamp">Duration</TableHeaderColumn>
                    </BootstrapTable>
                </div>
            </div>
        );
    }

}
