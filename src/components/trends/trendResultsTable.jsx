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

import TrendGraph from './trendGraph';

export default class TrendResultsTable extends React.Component {
    static propTypes = {
        results: PropTypes.object.isRequired
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
    static columnFormatter(operation) {
        return `<div class="trends-table__left">${operation}</div>`;
    }
    static countColumnFormatter(cell) {
        return `<div class="trends-table__right">${cell.count}</div>`;
    }
    static meanDurationColumnFormatter(cell) {
        return `<div class="trends-table__right">${cell.meanDuration}ms</div>`;
    }
    static successPercentFormatter(cell) {
        return (
            <div className="text-right">
                <div className="percentContainer text-center">
                    <CircularProgressbar percentage={cell.successPercent} strokeWidth={8}/>
                </div>
            </div>);
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
            return <TrendGraph />;
        }
        return null;
    }

    render() {
        const tableHeaderRightAlignedStyle = { border: 'none', textAlign: 'right' };
        const tableHeaderStyle = { border: 'none' };
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
                (<p>Showing { (to - start) + 1 } out of { total } total {total > 1 ? 'operations' : 'operation'}</p>),
            hideSizePerPage: true, // Hide page size bar
            defaultSortName: 'operationName',  // default sort column name
            defaultSortOrder: 'desc',  // default sort order
            expandBodyClass: 'expand-row-body',
            expanding: this.state.expanding,
            onExpand: this.handleExpand
        };
        return (
            <BootstrapTable
                data={this.props.results}
                tableStyle={{ border: 'none' }}
                trClassName="tr-no-border"
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                pagination
                options={options}
            >
                <TableHeaderColumn
                    isKey
                    dataFormat={TrendResultsTable.columnFormatter}
                    caretRender={TrendResultsTable.getCaret}
                    dataField="operationName"
                    width="60"
                    dataSort
                    sortFunc={this.sortByTimestamp}
                    thStyle={tableHeaderStyle}
                ><TrendResultsTable.Header name="Operation Name"/></TableHeaderColumn>
                <TableHeaderColumn
                    caretRender={TrendResultsTable.getCaret}
                    dataField="summary"
                    dataFormat={TrendResultsTable.countColumnFormatter}
                    width="12"
                    dataSort
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Count"/></TableHeaderColumn>
                <TableHeaderColumn
                    caretRender={TrendResultsTable.getCaret}
                    dataField="summary"
                    dataFormat={TrendResultsTable.meanDurationColumnFormatter}
                    width="12"
                    dataSort
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Mean Duration"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="summary"
                    dataFormat={TrendResultsTable.successPercentFormatter}
                    width="12"
                    dataSort
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Success Percentage"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
