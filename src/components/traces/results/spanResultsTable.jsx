/* eslint-disable */
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
import CircularProgressbar from 'react-circular-progressbar';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import formatters from '../../../utils/formatters';
import colorMapper from '../../../utils/serviceColorMapper';
import '../../common/resultsTable.less';

export default class TraceResultsTable extends React.Component {
    static propTypes = {
        results: PropTypes.array.isRequired,
        location: PropTypes.object.isRequired
    };

    static linkFormatter(traceId) {
        return `<div class="table__secondary"><a href="/">${traceId}</a></div>`;
    }

    static serviceFormatter(service) {
        return `<div class="table__secondary">
        <span class="service-spans label ${colorMapper.toBackgroundClass(service)}">${service}</span>
        </div>`;
    }

    static timeColumnFormatter(startTime) {
        return `<div class="table__secondary">${formatters.toTimestring(startTime)}</div>`;
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

    static tagsFormatter(tags) {
        let tagsList = '';
        tags.map((tag) => {
            tagsList += `<span class="table-tags-listing__item">${tag.key}=${tag.value}</span> `;
            return tagsList;
        });


        return `<div class="table-tags-listing">${tagsList}<div><a>+ 24 more tags</a></div></div>`;
    }

    static totalDurationColumnFormatter(duration) {
        return `<div class="table__secondary text-right">${formatters.toDurationString(duration)}</div>`;
    }

    static durationFormatter(duration) {
        return <div className="table__primary text-right">{formatters.toDurationString(duration)}</div>;
    }

    static durationPercentFormatter(cell) {
        return (
            <div className="text-right">
                <div className="percentDialContainer text-center">
                    <CircularProgressbar percentage={cell} strokeWidth={8}/>
                </div>
            </div>);
    }

    static Header({name}) {
        return <span className="results-header">{name}</span>;
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
            hideSelectColumn: true
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
            hideSizePerPage: true // Hide page size bar
        };

        const tableHeaderStyle = { border: 'none' };
        const filter = {type: 'RegexFilter', delay: 500, placeholder: 'Filter Operations (Regex)...'};
        return (
                <BootstrapTable
                    data={results}
                    className="trends-panel"
                    tableStyle={{ border: 'none' }}
                    trClassName="tr-no-border"
                    options={options}
                    pagination
                    selectRow={selectRowProp}
                >
                    <TableHeaderColumn
                        dataField="traceId"
                        width="10"
                        dataFormat={TraceResultsTable.linkFormatter}
                        thStyle={tableHeaderStyle}
                        headerText={''}
                    ><TraceResultsTable.Header name="TraceId"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="spanId"
                        width="10"
                        thStyle={tableHeaderStyle}
                        headerText={''}
                        isKey
                    ><TraceResultsTable.Header name="SpanId"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="startTime"
                        dataFormat={TraceResultsTable.timeColumnFormatter}
                        width="10"
                        thStyle={tableHeaderStyle}
                        headerText={'Start time of the first span in local timezone'}
                    ><TraceResultsTable.Header name="Start Time"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="serviceName"
                        dataFormat={TraceResultsTable.serviceFormatter}
                        width="20"
                        filter={filter}
                        thStyle={tableHeaderStyle}
                        headerText={'Service name'}
                    ><TraceResultsTable.Header name="Service"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="operationName"
                        width="20"
                        filter={filter}
                        thStyle={tableHeaderStyle}
                        headerText={'Operation name'}
                    ><TraceResultsTable.Header name="Operation"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="error"
                        width="5"
                        dataFormat={TraceResultsTable.errorFormatter}
                        filter={filter}
                        thStyle={tableHeaderStyle}
                        headerText={'Success of the span'}
                    ><TraceResultsTable.Header name="Success"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="duration"
                        dataFormat={TraceResultsTable.totalDurationColumnFormatter}
                        width="8"
                        filter={filter}
                        thStyle={tableHeaderStyle}
                        headerText={'Duration of the span'}
                    ><TraceResultsTable.Header name="Duration"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="tags"
                        width="50"
                        dataFormat={TraceResultsTable.tagsFormatter}
                        filter={filter}
                        thStyle={tableHeaderStyle}
                        headerText={'Tags of the span'}
                    ><TraceResultsTable.Header name="Tags"/></TableHeaderColumn>
                </BootstrapTable>
        );
    }
}
