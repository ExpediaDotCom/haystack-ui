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
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Sparklines, SparklinesCurve, SparklinesSpots } from 'react-sparklines';
import formatters from '../../../utils/formatters';

import TrendDetails from './../details/trendDetails';

import './trendResultsTable.less';

export default class TrendResultsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        trendsSearchStore: PropTypes.object.isRequired
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
        return `<div class="table__right">${formatters.toNumberString(cell)}</div>`;
    }

    static meanDurationColumnFormatter(cell) {
        const values = [];
        cell.map(d => values.push(d.value));
        return (<div className="duration-sparklines">
                    <Sparklines className="sparkline" data={values} min={0}>
                        <SparklinesCurve style={{ strokeWidth: 1 }} color="#e23474" />
                        <SparklinesSpots />
                    </Sparklines>
                </div>);
    }

    static successPercentFormatter(cell) {
        if (cell === null) {
            return null;
        }

        let stateColor = 'green';
        if (cell < 95) {
            stateColor = 'red';
        } else if (cell < 99) {
            stateColor = 'orange';
        }

        return <div className={`percentContainer text-right ${stateColor}`}>{cell.toFixed(2)}%</div>;
    }

    static sortByName(a, b, order) {
        if (order === 'desc') {
            return a.operationName.toLowerCase().localeCompare(b.operationName.toLowerCase());
        }
        return b.operationName.toLowerCase().localeCompare(a.operationName.toLowerCase());
    }

    static sortByCount(a, b, order) {
        if (order === 'desc') {
            return b.count - a.count;
        }
        return a.count - b.count;
    }

    static sortByDuration(a, b, order) {
        const aObj = a.tp99Duration[a.tp99Duration.length - 1];
        const bObj = b.tp99Duration[b.tp99Duration.length - 1];
        const aValue = (aObj && aObj.value) || 0;
        const bValue = (bObj && bObj.value) || 0;
        if (order === 'desc') {
            return bValue - aValue;
        }
        return aValue - bValue;
    }

    static sortByPercentage(a, b, order) {
        if (order === 'desc') {
            return b.successPercent - a.successPercent;
        }
        return a.successPercent - b.successPercent;
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
        const opName = this.props.trendsSearchStore.serviceQuery.operationName;
        if (opName) {
            this.handleExpand(opName, true);
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
        if (this.state.selected.filter(id => id === row.operationName).length > 0) {
            return <TrendDetails store={this.props.trendsSearchStore} location={this.props.location} serviceName={this.props.serviceName} opName={row.operationName} />;
        }
        return null;
    }

    render() {
        const tableHeaderRightAlignedStyle = {border: 'none', textAlign: 'right'};
        const tableHeaderStyle = {border: 'none'};
        const operation = this.props.trendsSearchStore.serviceQuery.operationName;
        const filter = operation
            ? {type: 'TextFilter', defaultValue: operation, placeholder: 'Search Operations...'}
            : {type: 'TextFilter', placeholder: 'Search Operations...'};

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
            defaultSortName: 'count',  // default sort column name
            defaultSortOrder: 'desc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body'
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
                className="trends-panel"
                data={this.props.trendsSearchStore.serviceResults}
                tableStyle={{border: 'none'}}
                trClassName="tr-no-border"
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                selectRow={selectRowProp}
                pagination
                options={options}
            >

                <TableHeaderColumn
                    isKey
                    dataFormat={TrendResultsTable.columnFormatter}
                    dataField="operationName"
                    width="50"
                    dataSort
                    sortFunc={TrendResultsTable.sortByName}
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderStyle}
                    filter={filter}
                    headerText={'All operations for the service'}
                ><TrendResultsTable.Header name="Operation"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="count"
                    dataFormat={TrendResultsTable.countColumnFormatter}
                    width="12"
                    dataSort
                    sortFunc={TrendResultsTable.sortByCount}
                    filter={{
                        type: 'NumberFilter',
                        delay: 500,
                        numberComparators: ['>', '<='],
                        defaultValue: { comparator: '>' },
                        placeholder: 'Count'
                    }}
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Total invocation count of the operation for summary duration'}
                ><TrendResultsTable.Header name="Count"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="tp99Duration"
                    dataFormat={TrendResultsTable.meanDurationColumnFormatter}
                    width="20"
                    dataSort
                    sortFunc={TrendResultsTable.sortByDuration}
                    filter={{
                        type: 'NumberFilter',
                        delay: 500,
                        numberComparators: ['>', '<='],
                        defaultValue: { comparator: '>' },
                        placeholder: 'Duration'
                    }}
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'TP99 duration for the operation. Sorting is based on duration of the last data point, which is marked as a dot'}
                ><TrendResultsTable.Header name="Duration TP99"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="successPercent"
                    dataFormat={TrendResultsTable.successPercentFormatter}
                    width="12"
                    dataSort
                    sortFunc={TrendResultsTable.sortByPercentage}
                    filter={{
                        type: 'NumberFilter',
                        delay: 500,
                        numberComparators: ['>', '<='],
                        defaultValue: { comparator: '>' },
                        placeholder: 'Percent'
                    }}
                    caretRender={TrendResultsTable.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Success % for the operation'}
                ><TrendResultsTable.Header name="Success %"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
