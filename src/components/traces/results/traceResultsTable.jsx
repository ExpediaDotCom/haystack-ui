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

import traceDetailsStore from '../stores/traceDetailsStore';
import TraceDetails from '../details/traceDetails';
import formatters from '../../../utils/formatters';
import colorMapper from '../../../utils/serviceColorMapper';
import '../../common/resultsTable.less';

export default class TraceResultsTable extends React.Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired
    };

    static sortByStartTime(a, b, order) {
        if (order === 'desc') {
            return b.startTime - a.startTime;
        }
        return a.startTime - b.startTime;
    }
    static sortByRootAndTime(a, b, order) {
        if (a.rootOperation === b.rootOperation) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return a.rootOperation.localeCompare(b.rootOperation);
        }
        return b.rootOperation.localeCompare(a.rootOperation);
    }
    static sortBySvcDurPcAndTime(a, b, order) {
        if (a.serviceDurationPercent === b.serviceDurationPercent) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return b.serviceDurationPercent - a.serviceDurationPercent;
        }
        return a.serviceDurationPercent - b.serviceDurationPercent;
    }
    static sortByOperDurPcAndTime(a, b, order) {
        if (a.operationDurationPercent === b.operationDurationPercent) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return b.operationDurationPercent - a.operationDurationPercent;
        }
        return a.operationDurationPercent - b.operationDurationPercent;
    }
    static sortBySuccessAndTime(a, b, order) {
        if (a.error === b.error) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return (a.error ? 1 : -1);
        }
        return (b.error ? 1 : -1);
    }
    static sortBySpansAndTime(a, b, order) {
        if (a.spanCount === b.spanCount) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return b.spanCount - a.spanCount;
        }
        return a.spanCount - b.spanCount;
    }

    static handleServiceList(services) {
        let serviceList = '';
        services.slice(0, 2).map((svc) => {
            serviceList += `<span class="service-spans label ${colorMapper.toBackgroundClass(svc.name)}">${svc.name} x${svc.spanCount}</span> `;
            return serviceList;
        });

        if (services.length > 2) {
            serviceList += '<span>...</span>';
        }
        return serviceList;
    }

    static timeColumnFormatter(startTime) {
        return `<div class="table__primary">${formatters.toTimeago(startTime)}</div>
                <div class="table__secondary">${formatters.toTimestring(startTime)}</div>`;
    }

    static rootColumnFormatter(cell, row) {
        return `<div class="table__primary">${row.rootOperation}</div>
                <div class="table__secondary">${row.root.url}</div>`;
    }

    static spanColumnFormatter(cell, row) {
        return `<div class="table__primary">${cell}</div>
                <div>${TraceResultsTable.handleServiceList(row.services)}</div>`;
    }

    static errorFormatter(cell) {
        if (cell) {
            return (<div className="table__status">
                <img src="/images/error.svg" alt="Error" height="24" width="24" />
            </div>);
        }
        return (<div className="table__status">
            <img src="/images/success.svg" alt="Success" height="24" width="24" />
        </div>);
    }

    static totalDurationColumnFormatter(duration) {
        return `<div class="table__primary-duration text-right">${formatters.toDurationString(duration)}</div>`;
    }

    static durationFormatter(duration) {
        return <div className="table__primary text-right">{formatters.toDurationString(duration)}</div>;
    }

    static durationPercentFormatter(cell) {
        return (
            <div className="text-right">
                <div className="percentContainer text-center">
                    <CircularProgressbar percentage={cell} strokeWidth={8}/>
                </div>
            </div>);
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

    static Header({name}) {
        return <span className="results-header">{name}</span>;
    }

    constructor(props) {
        super(props);
        this.state = {
            expanding: [],
            selected: []
        };
        this.handleExpand = this.handleExpand.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
    }
    componentDidMount() {
        const results = this.props.results;
        if (results.length === 1) {
            this.handleExpand(results[0].traceId, true);
        }
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
        if (this.state.selected.filter(id => id === row.traceId).length > 0) {
            return <TraceDetails traceId={row.traceId} location={this.props.location} serviceName={this.props.query.serviceName} traceDetailsStore={traceDetailsStore} />;
        }
        return null;
    }

    render() {
        const {
            query,
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
                (<p>Showing traces { start } to { to } out of { total } {total === 1 ? 'sample' : 'samples'}</p>),
            hideSizePerPage: true, // Hide page size bar
            defaultSortName: query.sortBy || 'startTime',  // default sort column name
            defaultSortOrder: 'desc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body'
        };

        const tableHeaderStyle = { border: 'none' };
        const tableHeaderRightAlignedStyle = { border: 'none', textAlign: 'right' };

        return (
            <BootstrapTable
                data={results}
                tableStyle={{ border: 'none' }}
                trClassName="tr-no-border"
                options={options}
                pagination
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                selectRow={selectRowProp}
            >
                <TableHeaderColumn
                    dataField="traceId"
                    hidden
                    isKey
                >TraceId</TableHeaderColumn>
                <TableHeaderColumn
                    dataField="startTime"
                    dataFormat={TraceResultsTable.timeColumnFormatter}
                    width="15"
                    dataSort
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderStyle}
                    headerText={'Start time of the first span in local timezone'}
                ><TraceResultsTable.Header name="Start Time"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="rootOperation"
                    dataFormat={TraceResultsTable.rootColumnFormatter}
                    width="25"
                    dataSort
                    sortFunc={TraceResultsTable.sortByRootAndTime}
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderStyle}
                    headerText={'Operation name of the root span'}
                ><TraceResultsTable.Header name="Root"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="error"
                    width="10"
                    dataFormat={TraceResultsTable.errorFormatter}
                    dataSort
                    sortFunc={TraceResultsTable.sortBySuccessAndTime}
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderStyle}
                    headerText={'Status of trace. Is marked failure if any spans in trace have success marked as false.'}
                ><TraceResultsTable.Header name="Success"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="spanCount"
                    dataFormat={TraceResultsTable.spanColumnFormatter}
                    width="25"
                    dataSort
                    sortFunc={TraceResultsTable.sortBySpansAndTime}
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderStyle}
                    headerText={'Total number of spans across all services in the trace'}
                ><TraceResultsTable.Header name="Span Count"/></TableHeaderColumn>
                {
                    (query.operationName && query.operationName !== 'all')
                    && <TableHeaderColumn
                        dataField="operationDuration"
                        dataFormat={TraceResultsTable.durationFormatter}
                        width="10"
                        dataSort
                        caretRender={TraceResultsTable.getCaret}
                        thStyle={tableHeaderRightAlignedStyle}
                        headerText={'Total busy time in timeline for the queried operation'}
                    ><TraceResultsTable.Header name="Op Duration"/></TableHeaderColumn>
                }
                {
                    (query.operationName && query.operationName !== 'all')
                    && <TableHeaderColumn
                        dataField="operationDurationPercent"
                        dataFormat={TraceResultsTable.durationPercentFormatter}
                        width="10"
                        dataSort
                        sortFunc={TraceResultsTable.sortByOperDurPcAndTime}
                        caretRender={TraceResultsTable.getCaret}
                        thStyle={tableHeaderRightAlignedStyle}
                        headerText={'Percentage of busy time in timeline for the queried operation as compared to duration of the trace'}
                    ><TraceResultsTable.Header name="Op Duration %"/></TableHeaderColumn>
                }
                <TableHeaderColumn
                    dataField="serviceDuration"
                    dataFormat={TraceResultsTable.durationFormatter}
                    width="10"
                    dataSort
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Total busy time in timeline for the queried service'}
                ><TraceResultsTable.Header name="Svc Duration"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="serviceDurationPercent"
                    dataFormat={TraceResultsTable.durationPercentFormatter}
                    width="10"
                    dataSort
                    sortFunc={TraceResultsTable.sortBySvcDurPcAndTime}
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Percentage of busy time in timeline for the queried service as compared to duration of the trace'}
                ><TraceResultsTable.Header name="Svc Duration %"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="duration"
                    dataFormat={TraceResultsTable.totalDurationColumnFormatter}
                    width="10"
                    dataSort
                    caretRender={TraceResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Duration of the span. It is the difference between the start time of earliest operation and the end time of last operation in the trace'}
                ><TraceResultsTable.Header name="Total Duration"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
