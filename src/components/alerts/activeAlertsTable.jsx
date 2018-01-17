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
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Sparklines, SparklinesCurve} from 'react-sparklines';

import AlertDetails from './details/alertDetails';
import alertDetailsStore from './stores/alertDetailsStore';
import formatters from '../../utils/formatters';

export default class ActiveAlertsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        results: PropTypes.object.isRequired
    };

    static nameColumnFormatter(cell) {
        return `<div class="table__primary">${cell}</div>`;
    }

    static typeColumnFormatter(cell) {
        return `<div class="table__primary">${formatters.toAlertTypeString(cell)}</div>`;
    }

    static statusColumnFormatter(cell) {
        if (cell) {
            return '<span class="label label-success table__large-label">Healthy</span>';
        }
        return '<span class="label label-failure table__large-label">Unhealthy</span>';
    }

    static timestampColumnFormatter(timestamp) {
        return `<div class="table__primary">${formatters.toTimeago(timestamp)}</div>
                <div class="table__secondary">${formatters.toTimestring(timestamp)}</div>`;
    }

    static valueColumnFormatter(cell, row) {
        const values = [];
        cell.map(d => values.push(d.value));

        return (
            <div className="sparkline-container">
                <div className="sparkline-graph">
                    <Sparklines className="sparkline" data={values} min={0} height={40}>
                        <SparklinesCurve style={{ strokeWidth: 1 }} color={row.status ? '#4CAF50' : '#e23474'} />
                    </Sparklines>
                </div>
            </div>
        );
    }

    static Header({name}) {
        return <span className="results-header">{name}</span>;
    }

    static getCaret(direction) {
        if (direction === 'asc') {
            return (
                <span className="order dropup">
                  <span className="caret" style={{margin: '10px 5px'}}/>
              </span>);
        }
        if (direction === 'desc') {
            return (
                <span className="order dropdown">
                  <span className="caret" style={{margin: '10px 5px'}}/>
              </span>);
        }
        return <div/>;
    }

    static rowClassNameFormat(row) {
        return row.status ? 'tr-no-border' : 'tr-no-border alert-details__alert-glow';
    }

    constructor(props) {
        super(props);
        this.state = {
            expanding: [],
            selected: []
        };

        this.handleExpand = this.handleExpand.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.getUnhealthyAlerts = this.getUnhealthyAlerts.bind(this);
    }

    getUnhealthyAlerts() {
        let unhealthyAlerts = 0;
        this.props.results.forEach((alert) => {
            if (!alert.status) {
                unhealthyAlerts += 1;
            }
        });
        return unhealthyAlerts;
    }

    handleExpand(rowKey, isExpand) {
        if (isExpand) {
            this.setState(
                {
                    expanding: [rowKey],
                    selected: [rowKey]
                }
            );
        } else {
            this.setState(
                {
                    expanding: [],
                    selected: []
                }
            );
        }
    }

    expandComponent(row) {
        if (this.state.selected.filter(alertId => alertId === row.alertId).length > 0) {
            return (<AlertDetails row={row} serviceName={encodeURIComponent(this.props.serviceName)} alertDetailsStore={alertDetailsStore} />);
        }
        return null;
    }

    render() {
        const {
            results
        } = this.props;

        const selectRowProp = {
            clickToSelect: true,
            clickToExpand: true,
            className: 'selected-row',
            mode: 'checkbox',
            hideSelectColumn: true,
            selected: this.state.selected
        };

        const options = {
            page: 1,  // which page you want to show as default
            sizePerPage: 15,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            paginationShowsTotal: (start, to, total) =>
                (<p>Showing alerts { start } to { to } out of { total }</p>),
            hideSizePerPage: true, // Hide page size bar
            defaultSortName: 'status',
            defaultSortOrder: 'asc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body'
        };

        const tableHeaderStyle = { border: 'none' };
        const tableHeaderRightAlignedStyle = { border: 'none', textAlign: 'right' };

        return (
            <div>
                <h5>
                    <span className="alerts__title-bold">{this.getUnhealthyAlerts()}</span> unhealthy alerts out of <span className="alerts__title-bold">{this.props.results.length}</span> total for {this.props.serviceName}
                </h5>
                <BootstrapTable
                    className="table-panel"
                    data={results}
                    tableStyle={{ border: 'none' }}
                    trClassName={ActiveAlertsTable.rowClassNameFormat}
                    options={options}
                    pagination
                    expandableRow={() => true}
                    expandComponent={this.expandComponent}
                    selectRow={selectRowProp}
                    multiColumnSort={2}
                >
                    <TableHeaderColumn
                        dataField="alertId"
                        hidden
                        isKey
                    >AlertId</TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={ActiveAlertsTable.getCaret}
                        dataFormat={ActiveAlertsTable.nameColumnFormatter}
                        dataField="operationName"
                        width="15"
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Operation Name'}
                    ><ActiveAlertsTable.Header name="Operation Name"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={ActiveAlertsTable.getCaret}
                        dataField="type"
                        width="10"
                        dataFormat={ActiveAlertsTable.typeColumnFormatter}
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Alert Type'}
                    ><ActiveAlertsTable.Header name="Alert Type"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={ActiveAlertsTable.getCaret}
                        dataField="status"
                        width="10"
                        dataFormat={ActiveAlertsTable.statusColumnFormatter}
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Status'}
                    ><ActiveAlertsTable.Header name="Status"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={ActiveAlertsTable.getCaret}
                        dataFormat={ActiveAlertsTable.timestampColumnFormatter}
                        dataField="timestamp"
                        width="12"
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Alert Timestamp'}
                    ><ActiveAlertsTable.Header name="Last Status Change"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={ActiveAlertsTable.getCaret}
                        dataField="value"
                        width="12"
                        dataFormat={ActiveAlertsTable.valueColumnFormatter}
                        dataSort
                        thStyle={tableHeaderRightAlignedStyle}
                        headerText={'Value'}
                    ><ActiveAlertsTable.Header name="Metric"/></TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
}
