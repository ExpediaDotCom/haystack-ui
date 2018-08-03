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
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import ColorHash from 'color-hash';

import formatters from '../../../utils/formatters';
import colorMapper from '../../../utils/serviceColorMapper';
import '../../common/resultsTable.less';

const colorHashLight = new ColorHash({lightness: 0.95});
const colorHashDark = new ColorHash({lightness: 0.4});

export default class SpansResultsTable extends React.Component {
    static propTypes = {
        results: PropTypes.array.isRequired,
        location: PropTypes.object.isRequired
    };

    static linkFormatter(traceId) {
        return `<div class="spans-panel__traceid" 
                    style="background-color: ${colorHashLight.hex(traceId)}; border-color: ${colorHashDark.hex(traceId)}">
                    <span class="ti-new-window"></span> <a class="spans-panel__traceid-link" href="/">${traceId}</a>
                </div>`;
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
        tags.slice(0, 5).map((tag) => {
            tagsList += `<span class="spans-panel__tags-listing-item">${tag.key}=${tag.value}</span> `;
            return tagsList;
        });

        const moreMessage = tags.length > 5
            ? `<a class="spans-panel__tags-listing-more-msg">+ ${tags.length - 5} more tags</a>`
            : '';

        return `<div class="spans-panel__tags-listing">${tagsList} ${moreMessage}<div>`;
    }

    static totalDurationColumnFormatter(duration) {
        return `<div class="table__secondary text-right">${formatters.toDurationString(duration)}</div>`;
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
        const filter = {type: 'RegexFilter', delay: 0, placeholder: ' '};
        return (
                <BootstrapTable
                    data={results}
                    className="spans-panel"
                    tableStyle={{ border: 'none' }}
                    trClassName="tr-no-border"
                    options={options}
                    pagination
                    selectRow={selectRowProp}
                >
                    <TableHeaderColumn
                        dataField="traceId"
                        width="20"
                        dataFormat={SpansResultsTable.linkFormatter}
                        thStyle={tableHeaderStyle}
                        headerText={''}
                    ><SpansResultsTable.Header name="TraceId"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="spanId"
                        width="10"
                        thStyle={tableHeaderStyle}
                        headerText={''}
                        isKey
                    ><SpansResultsTable.Header name="SpanId"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="startTime"
                        dataFormat={SpansResultsTable.timeColumnFormatter}
                        width="10"
                        thStyle={tableHeaderStyle}
                        headerText={'Start time of the first span in local timezone'}
                    ><SpansResultsTable.Header name="Start Time"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="serviceName"
                        dataFormat={SpansResultsTable.serviceFormatter}
                        width="20"
                        filter={{...filter, placeholder: 'Filter service...'}}
                        thStyle={tableHeaderStyle}
                        headerText={'Service name'}
                    ><SpansResultsTable.Header name="Service"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="operationName"
                        width="20"
                        filter={{...filter, placeholder: 'Filter operations...'}}
                        thStyle={tableHeaderStyle}
                        headerText={'Operation name'}
                    ><SpansResultsTable.Header name="Operation"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="error"
                        width="5"
                        dataFormat={SpansResultsTable.errorFormatter}
                        filter={{...filter, placeholder: 'Filter true/false...'}}
                        thStyle={tableHeaderStyle}
                        headerText={'Success of the span'}
                    ><SpansResultsTable.Header name="Success"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="duration"
                        dataFormat={SpansResultsTable.totalDurationColumnFormatter}
                        width="10"
                        filter={{...filter, placeholder: 'Filter duration...'}}
                        thStyle={tableHeaderStyle}
                        headerText={'Duration of the span'}
                    ><SpansResultsTable.Header name="Duration"/></TableHeaderColumn>
                    <TableHeaderColumn
                        dataField="tags"
                        width="75"
                        dataFormat={SpansResultsTable.tagsFormatter}
                        filter={{...filter, placeholder: 'Filter tags...'}}
                        thStyle={tableHeaderStyle}
                        headerText={'Tags of the span'}
                    ><SpansResultsTable.Header name="Tags"/></TableHeaderColumn>
                </BootstrapTable>
        );
    }
}
