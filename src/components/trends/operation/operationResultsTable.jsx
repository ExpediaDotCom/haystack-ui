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
import trendTableFormatters from '../utils/trendsTableFormatters';

import TrendDetails from './../details/trendDetails';

import './operationResultsTable.less';

export default class OperationResultsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        operationStore: PropTypes.object.isRequired
    };

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
        const opName = this.props.operationStore.statsQuery.operationName;
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
            return <TrendDetails serviceSummary={false} store={this.props.operationStore} location={this.props.location} serviceName={this.props.serviceName} opName={row.operationName} />;
        }
        return null;
    }

    render() {
        const tableHeaderRightAlignedStyle = {border: 'none', textAlign: 'right'};
        const tableHeaderStyle = {border: 'none'};
        const operation = this.props.operationStore.statsQuery.operationName;
        const filter = operation
            ? {type: 'TextFilter', defaultValue: operation, delay: 500, placeholder: 'Search Operations...'}
            : {type: 'TextFilter', delay: 500, placeholder: 'Search Operations...'};

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
            defaultSortName: 'totalCount',  // default sort column name
            defaultSortOrder: 'desc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body',
            noDataText: 'No such operation found, try clearing filters'
        };

        const selectRowProp = {
            clickToSelect: true,
            clickToExpand: true,
            className: 'selected-row',
            mode: 'checkbox',
            hideSelectColumn: true,
            selected: this.state.selected
        };

        const numberFilterFormatter = {
            type: 'NumberFilter',
            delay: 500,
            numberComparators: ['>', '<'],
            defaultValue: { comparator: '>' }
        };

        return (
            <BootstrapTable
                className="trends-panel"
                data={this.props.operationStore.statsResults}
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
                    dataFormat={trendTableFormatters.columnFormatter}
                    dataField="operationName"
                    width="50"
                    dataSort
                    sortFunc={trendTableFormatters.sortByName}
                    caretRender={trendTableFormatters.getCaret}
                    thStyle={tableHeaderStyle}
                    filter={filter}
                    headerText={'All operations for the service'}
                ><OperationResultsTable.Header name="Operation"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="totalCount"
                    dataFormat={trendTableFormatters.countColumnFormatter}
                    width="15"
                    dataSort
                    sortFunc={trendTableFormatters.sortByTotalCount}
                    filter={{
                        ...numberFilterFormatter,
                        placeholder: 'Total Count...'
                    }}
                    caretRender={trendTableFormatters.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Total invocation count of the operation for summary duration'}
                ><OperationResultsTable.Header name="Count"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="latestTp99Duration"
                    dataFormat={trendTableFormatters.durationColumnFormatter}
                    width="15"
                    dataSort
                    filter={{
                        ...numberFilterFormatter,
                        placeholder: 'Last TP99 in ms...'
                    }}
                    caretRender={trendTableFormatters.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'TP99 duration for the operation. Sorting is based on duration of the last data point, which is marked as a dot'}
                ><OperationResultsTable.Header name="Duration TP99"/></TableHeaderColumn>
                <TableHeaderColumn
                    dataField="avgSuccessPercent"
                    dataFormat={trendTableFormatters.successPercentFormatter}
                    width="15"
                    dataSort
                    sortFunc={trendTableFormatters.sortByAvgPercentage}
                    filter={{
                        ...numberFilterFormatter,
                        defaultValue: { comparator: '<' },
                        placeholder: 'Avg Success %...'
                    }}
                    caretRender={trendTableFormatters.getCaret}
                    thStyle={tableHeaderRightAlignedStyle}
                    headerText={'Success % for the operation'}
                ><OperationResultsTable.Header name="Success %"/></TableHeaderColumn>
            </BootstrapTable>
        );
    }
}
