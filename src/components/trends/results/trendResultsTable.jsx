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
import CircularProgressbar from 'react-circular-progressbar';
import { Sparklines, SparklinesLine } from 'react-sparklines';

import TrendDetails from './../details/trendDetails';

import './trendResultsTable.less';

export default class TrendResultsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        store: PropTypes.object.isRequired
    };

    static Header({name}) {
        return <span className="results-header">{name}</span>;
    }

    static columnFormatter(operation) {
        return `<div class="table__left">${operation}</div>`;
    }

    static countColumnFormatter(cell) {
        return `<div class="table__right">${cell > 0 ? cell : ' '}</div>`;
    }

    static meanDurationColumnFormatter(cell) {
        const values = [];
        cell.map(d => values.push(d.value));
        return (<div>
                    <Sparklines className="sparkline" data={values}>
                        <SparklinesLine color="#e23474" />
                    </Sparklines>
                </div>);
    }

    static successPercentFormatter(cell) {
        return (
            <div className="text-right">
                <div className="percentContainer text-center">
                    { cell ?
                        <CircularProgressbar percentage={cell} strokeWidth={8}/> :
                        ' ' }
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
            return b.count - a.count;
        }
        return a.count - b.count;
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
            return <TrendDetails store={this.props.store} serviceName={this.props.serviceName} opName={row.operationName} />;
        }
        return null;
    }

    render() {
        const tableHeaderRightAlignedStyle = {border: 'none', textAlign: 'right'};
        const tableHeaderCenterAlignedStyle = {border: 'none', textAlign: 'center'};
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
                data={this.props.store.serviceResults}
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
                    sortFunc={TrendResultsTable.sortByName}
                    thStyle={tableHeaderStyle}
                    filter={{type: 'TextFilter', placeholder: 'Search Operations...'}}
                />
                <TableHeaderColumn
                    dataField="count"
                    dataFormat={TrendResultsTable.countColumnFormatter}
                    width="10"
                    dataSort
                    sortFunc={TrendResultsTable.sortByCount}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Count"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="tp99Duration"
                    dataFormat={TrendResultsTable.meanDurationColumnFormatter}
                    width="20"
                    thStyle={tableHeaderCenterAlignedStyle}
                ><TrendResultsTable.Header name="Mean TP99"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="successPercent"
                    dataFormat={TrendResultsTable.successPercentFormatter}
                    width="8"
                    dataSort
                    sortFunc={TrendResultsTable.sortByPercentage}
                    thStyle={tableHeaderRightAlignedStyle}
                ><TrendResultsTable.Header name="Success %"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
