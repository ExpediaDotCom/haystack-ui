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
import CircularProgressbar from 'react-circular-progressbar';
import formatters from '../../utils/formatters';
import TrendTimeRangePicker from './trendTimeRangePicker';
import '../common/resultsTable.less';
import './trendResultsTable.less';

import TrendResultExpand from './trendResultExpand';

export default class TrendResultsTable extends React.Component {
    static propTypes = {
        results: PropTypes.object.isRequired,
        trendsSearchStore: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired
    };

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

    static columnFormatter(operation) {
        return `<div class="table__left">${operation}</div>`;
    }

    static countColumnFormatter(cell) {
        return `<div class="table__right">${cell.count > 0 ? cell.count : ' '}</div>`;
    }

    static meanDurationColumnFormatter(cell, row) {
        return `<div class="table__right">${row.summary.meanDuration > 0 ? formatters.toDurationString(row.summary.meanDuration * 1000) : ' '}</div>`;
    }

    static successPercentFormatter(cell, row) {
        return (
            <div className="text-right">
                <div className="percentContainer text-center">
                    { row.summary.successPercent !== null ?
                        <CircularProgressbar percentage={row.summary.successPercent} strokeWidth={8}/> :
                        null }
                </div>
            </div>
        );
    }

    static sortByName(a, b, order) {
        if (order === 'desc') {
            return a.operationName.toLowerCase().localeCompare(b.operationName.toLowerCase());
        }
        return b.operationName.toLowerCase().localeCompare(a.operationName.toLowerCase());
    }

    static sortByCount(a, b, order) {
        if (order === 'desc') {
            return b.summary.count - a.summary.count;
        }
        return a.summary.count - b.summary.count;
    }

    static sortByMean(a, b, order) {
        if (order === 'desc') {
            return b.summary.meanDuration - a.summary.meanDuration;
        }
        return a.summary.meanDuration - b.summary.meanDuration;
    }

    static sortByPercentage(a, b, order) {
        if (order === 'desc') {
            return b.summary.successPercent - a.summary.successPercent;
        }
        return a.summary.successPercent - b.summary.successPercent;
    }

    constructor(props) {
        super(props);
        this.state = {
            expanding: [],
            selected: []
        };
        this.handleExpand = this.handleExpand.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.trendsToolBar = this.trendsToolBar.bind(this);
        this.timeRangeCallback = this.timeRangeCallback.bind(this);
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
        if (this.state.selected.filter(id => id === row.operationName).length > 0) {
            return <TrendResultExpand data={row}/>;
        }
        return null;
    }

    timeRangeCallback(timeRange, timeWindow) {
        const reqQuery = {
            serviceName: `${this.props.match.params.serviceName}`,
            timeWindow,
            from: timeRange.from,
            until: timeRange.until
        };
        this.props.trendsSearchStore.fetchSearchResults(reqQuery);
    }

    trendsToolBar(props) {
        return (
            <section>
                <div className="toolbar">
                    <div className="toolbar-search">{props.components.searchPanel}</div>
                    <TrendTimeRangePicker className="toolbar-timerangepicker btn-group" timeRangeCallback={this.timeRangeCallback}/>
                </div>
            </section>
        );
    }

    render() {
        const tableHeaderRightAlignedStyle = {border: 'none', textAlign: 'right'};
        const tableHeaderStyle = {border: 'none'};

        const options = {
            page: 1,  // which page you want to show as default
            sizePerPage: 20,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            paginationShowsTotal: (start, to, total) =>
                (<p>Showing { (to - start) + 1 } out of { total } total {total === 1 ? 'operation' : 'operations'}</p>),
            hideSizePerPage: true, // Hide page size bar
            defaultSortName: 'operationName',  // default sort column name
            defaultSortOrder: 'desc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body',
            toolBar: this.trendsToolBar
        };

        const selectRowProp = {
            clickToSelect: true,
            clickToExpand: true,
            className: 'selected-row',
            mode: 'checkbox',
            hideSelectColumn: true,
            selected: this.state.selected
        };

        return (
            <BootstrapTable
                data={this.props.results}
                tableStyle={{border: 'none'}}
                trClassName="tr-no-border"
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                selectRow={selectRowProp}
                pagination
                options={options}
                search
                searchPlaceholder="Filter Operations..."
                exportCSV
            >

                <TableHeaderColumn
                    isKey
                    dataFormat={TrendResultsTable.columnFormatter}
                    caretRender={TrendResultsTable.getCaret}
                    dataField="operationName"
                    width="50"
                    dataSort
                    sortFunc={TrendResultsTable.sortByName}
                    thStyle={tableHeaderStyle}
                ><TrendResultsTable.Header name="Operation"/></TableHeaderColumn>
                <TableHeaderColumn
                    caretRender={TrendResultsTable.getCaret}
                    dataField="summary"
                    dataFormat={TrendResultsTable.countColumnFormatter}
                    width="12"
                    dataSort
                    sortFunc={TrendResultsTable.sortByCount}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Count"/></TableHeaderColumn>
                <TableHeaderColumn
                    caretRender={TrendResultsTable.getCaret}
                    dataField="timeWindow"
                    dataFormat={TrendResultsTable.meanDurationColumnFormatter}
                    width="12"
                    dataSort
                    sortFunc={TrendResultsTable.sortByMean}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Mean Duration"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="rawValues"
                    dataFormat={TrendResultsTable.successPercentFormatter}
                    width="10"
                    dataSort
                    sortFunc={TrendResultsTable.sortByPercentage}
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Success %"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
