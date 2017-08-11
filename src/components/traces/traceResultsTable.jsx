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
import CircularProgressbar from 'react-circular-progressbar';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import './traceResultsTable.less';

export default class TraceResultsTable extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        tracesSearchStore: PropTypes.object.isRequired
    }

    static sortByTimestamp(a, b, order) {
        if (order === 'desc') {
            return b.startTime - a.startTime;
        }
        return a.startTime - b.startTime;
    }
    static sortByDuration(a, b, order) {
        if (order === 'desc') {
            return b.duration - a.duration;
        }
        return a.duration - b.duration;
    }

    static handleServiceList(services) {
        let serviceList = '';
        services.map((svc) => {
            serviceList += `<span class="service-spans label label-success">${svc.name} x${svc.spanCount}</span> `;
            return serviceList;
        });
        return serviceList;
    }

    static timeColumnFormatter(cell, row) {
        return `<div class="table__primary">${row.timeago}</div>
                <div class="table__secondary">${cell}</div>`;
    }

    static rootColumnFormatter(cell, row) {
        return `<div class="table__primary">${row.root.url}</div>
                <div class="table__secondary">${row.root.serviceName}:${row.root.operationName}</div>`;
    }

    static spanColumnFormatter(cell, row) {
        return `<div class="table__primary">${cell}</div>
                <div class="table__secondary">${TraceResultsTable.handleServiceList(row.services)}</div>`;
    }

    static errorFormatter(cell) {
        if (cell) {
            return (<div className="table__status">
                <span className="table__status-error ti-close" />
            </div>);
        }
        return (<div className="table__status">
            <span className="table__status-success ti-check" />
        </div>);
    }

    static totalDurationColumnFormatter(cell) {
        return `<div class="table__primary-duration text-right">${Math.round(cell / 1000)} ms</div>`;
    }

    static serviceDurationFormatter(cell) {
        return <div className="table__primary text-right">{Math.round(cell / 1000)} ms</div>;
    }

    static serviceDurationPercentFormatter(cell) {
        return (<div className="percentContainer">
            <CircularProgressbar percentage={cell} strokeWidth={6}/>
        </div>);
    }

    constructor(props) {
        super(props);
        this.rowLink = this.rowLink.bind(this);
    }

    rowLink(row) {
        this.props.history.push(`/traces/${row.traceId}`);
    }

    render() {
        const results = this.props.tracesSearchStore.searchResults;
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
                (<p>Showing traces { start } to { to } out of { total } samples</p>),
            hideSizePerPage: true, // Hide page size bar
            onRowClick: this.rowLink,
            defaultSortName: 'timestamp',  // default sort column name
            defaultSortOrder: 'desc'  // default sort order
        };
        return (
            <BootstrapTable data={results} tableStyle={{ border: 'none' }} trClassName="tr-no-border" options={options} pagination>
                <TableHeaderColumn dataField="timestamp" sortFunc={this.sortByTimestamp} dataFormat={TraceResultsTable.timeColumnFormatter} dataSort width="12" thStyle={{ border: 'none' }}>Timestamp</TableHeaderColumn>
                <TableHeaderColumn isKey dataField="rootUrl" dataFormat={TraceResultsTable.rootColumnFormatter} dataSort width="25" thStyle={{ border: 'none' }}>Start URL</TableHeaderColumn>
                <TableHeaderColumn dataField="error" dataFormat={TraceResultsTable.errorFormatter} dataSort width="10" thStyle={{ border: 'none' }}>Success</TableHeaderColumn>
                <TableHeaderColumn dataField="spans" width="30" dataFormat={TraceResultsTable.spanColumnFormatter} dataSort thStyle={{ border: 'none' }}>Span Count</TableHeaderColumn>
                {this.props.tracesSearchStore.serviceInQueryString ?
                        [<TableHeaderColumn dataField="serviceDurationPercent" key="0" dataSort width="10" dataFormat={TraceResultsTable.serviceDurationPercentFormatter} thStyle={{ border: 'none' }}>
                            Svc Duration %
                        </TableHeaderColumn>,
                        <TableHeaderColumn dataField="serviceDuration" dataSort key="1" width="10" dataFormat={TraceResultsTable.serviceDurationFormatter} thStyle={{ border: 'none' }}>
                            Svc Duration
                        </TableHeaderColumn>]
                    : null }
                <TableHeaderColumn dataField="duration" dataSort width="10" sortFunc={this.sortByDuration} dataFormat={TraceResultsTable.totalDurationColumnFormatter} thStyle={{ border: 'none' }}>Total Duration</TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
