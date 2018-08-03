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
        isUniversalSearch: PropTypes.bool.isRequired
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
    static sortByRootSuccessAndTime(a, b, order) {
        if (a.rootError === b.rootError) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return (a.rootError ? 1 : -1);
        }
        return (b.rootError ? 1 : -1);
    }
    static sortByOperationSuccessAndTime(a, b, order) {
        if (a.operationError === b.operationError) {
            return TraceResultsTable.sortByStartTime(a, b, 'desc');
        }
        if (order === 'desc') {
            return (a.operationError ? 1 : -1);
        }
        return (b.operationError ? 1 : -1);
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
        return `<div class="table__primary">
                <span class="service-spans label ${colorMapper.toBackgroundClass(row.root.serviceName)}">${colorMapper.toBackgroundClass(row.root.serviceName)}</span> 
                ${row.root.operationName}
                </div>
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

    static serviceDurationFormatter(duration, row) {
        return (<div>
            <div className="table__primary text-right">{formatters.toDurationString(duration)}</div>
            <div className="table__secondary text-right">{row.serviceDurationPercent}% of total</div>
        </div>);
    }

    static operationDurationFormatter(duration, row) {
        return (<div>
            <div className="table__primary text-right">{formatters.toDurationString(duration)}</div>
            <div className="table__secondary text-right">{row.operationDurationPercent}% of total</div>
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
            return <TraceDetails traceId={row.traceId} serviceName={this.props.query.serviceName} traceDetailsStore={traceDetailsStore} isUniversalSearch={this.props.isUniversalSearch}/>;
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
            pageStartIndex: 1, // where to start counting the pages
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
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
                        dataField="rootError"
                        width="10"
                        dataFormat={TraceResultsTable.errorFormatter}
                        dataSort
                        sortFunc={TraceResultsTable.sortByRootSuccessAndTime}
                        caretRender={TraceResultsTable.getCaret}
                        thStyle={tableHeaderStyle}
                        headerText={'Success of the root service'}
                    ><TraceResultsTable.Header name="Root Success"/></TableHeaderColumn>
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
                            dataField="operationError"
                            dataFormat={TraceResultsTable.errorFormatter}
                            width="10"
                            dataSort
                            caretRender={TraceResultsTable.getCaret}
                            sortFunc={TraceResultsTable.sortByOperationSuccessAndTime}
                            thStyle={tableHeaderRightAlignedStyle}
                            headerText={'Success of the searched operation'}
                        ><TraceResultsTable.Header name="Op Success"/></TableHeaderColumn>
                    }
                    {
                        (query.operationName && query.operationName !== 'all')
                        && <TableHeaderColumn
                            dataField="operationDuration"
                            dataFormat={TraceResultsTable.operationDurationFormatter}
                            width="10"
                            dataSort
                            caretRender={TraceResultsTable.getCaret}
                            thStyle={tableHeaderRightAlignedStyle}
                            headerText={'Total busy time in timeline for the queried operation'}
                        ><TraceResultsTable.Header name="Op Duration"/></TableHeaderColumn>
                    }
                    {
                        query.serviceName
                        ? <TableHeaderColumn
                            dataField="serviceDuration"
                            dataFormat={TraceResultsTable.serviceDurationFormatter}
                            width="10"
                            dataSort
                            caretRender={TraceResultsTable.getCaret}
                            thStyle={tableHeaderRightAlignedStyle}
                            headerText={'Total busy time in timeline for the queried service'}
                        ><TraceResultsTable.Header name="Svc Duration"/></TableHeaderColumn>
                        : null
                    }
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
