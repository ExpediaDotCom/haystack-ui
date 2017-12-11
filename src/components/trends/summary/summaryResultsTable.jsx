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
import { Sparklines, SparklinesCurve, SparklinesSpots } from 'react-sparklines';
import formatters from '../../../utils/formatters';
import TrendDetails from '../details/trendDetails';

export default class SummaryResultsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        serviceSummaryStore: PropTypes.object.isRequired
    };

    static Header({name}) {
        return <span className="results-header">{name}</span>;
    }

    static columnFormatter(requestType) {
        return `<div class="table__left">${requestType}</div>`;
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
        return (
            <div className="text-right">
                <div className="percentContainer text-center">
                    { cell ?
                        <CircularProgressbar percentage={cell.toFixed(0)} strokeWidth={8}/> :
                        ' ' }
                </div>
            </div>
        );
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
        const opName = this.props.serviceSummaryStore.summaryQuery.operationName;
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
        if (this.state.selected.filter(id => id === row.Type).length > 0) {
            return <TrendDetails serviceSummary store={this.props.serviceSummaryStore} location={this.props.location} serviceName={this.props.serviceName} />;
        }
        return null;
    }

    render() {
        const tableHeaderRightAlignedStyle = {border: 'none', textAlign: 'right'};
        const tableHeaderStyle = {border: 'none'};

        const options = {
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
                data={this.props.serviceSummaryStore.summaryResults}
                tableStyle={{border: 'none'}}
                trClassName="tr-no-border"
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                selectRow={selectRowProp}
                options={options}
            >
                <TableHeaderColumn
                    isKey
                    dataFormat={SummaryResultsTable.columnFormatter}
                    dataField="Type"
                    width="50"
                    thStyle={tableHeaderStyle}
                />
                <TableHeaderColumn
                    dataField="count"
                    dataFormat={SummaryResultsTable.countColumnFormatter}
                    width="10"
                    thStyle={tableHeaderRightAlignedStyle}
                />
                <TableHeaderColumn
                    dataField="tp99Duration"
                    dataFormat={SummaryResultsTable.meanDurationColumnFormatter}
                    width="18"
                    thStyle={tableHeaderRightAlignedStyle}
                />
                <TableHeaderColumn
                    dataField="successPercent"
                    dataFormat={SummaryResultsTable.successPercentFormatter}
                    width="8"
                    thStyle={tableHeaderRightAlignedStyle}
                />
            </BootstrapTable>
        );
    }
}
