/*
 * Copyright 2018 Expedia Group
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
import TrendDetails from '../details/trendDetails';
import trendTableFormatters from '../utils/trendsTableFormatters';

export default class SummaryResultsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        serviceStore: PropTypes.object.isRequired
    };

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
        const opName = this.props.serviceStore.statsQuery.operationName;
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
        if (this.state.selected.filter(id => id === row.type).length > 0) {
            return (<TrendDetails
                serviceSummary
                store={this.props.serviceStore}
                location={this.props.location}
                serviceName={this.props.serviceName}
                statsType={row.type}
            />);
        }
        return null;
    }

    render() {
        const tableHeaderStyle = {display: 'none'};
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
                data={this.props.serviceStore.statsResults}
                tableStyle={{border: 'none'}}
                trClassName="tr-no-border"
                expandableRow={() => true}
                expandComponent={this.expandComponent}
                selectRow={selectRowProp}
                options={options}
            >
                <TableHeaderColumn
                    isKey
                    dataFormat={trendTableFormatters.columnFormatter}
                    dataField="type"
                    width="50"
                    thStyle={tableHeaderStyle}
                />
                <TableHeaderColumn
                    dataField="totalCount"
                    dataFormat={trendTableFormatters.countColumnFormatter}
                    width="15"
                    thStyle={tableHeaderStyle}
                />
                <TableHeaderColumn
                    dataField="latestTp99Duration"
                    dataFormat={trendTableFormatters.durationColumnFormatter}
                    width="15"
                    thStyle={tableHeaderStyle}
                />
                <TableHeaderColumn
                    dataField="avgSuccessPercent"
                    dataFormat={trendTableFormatters.successPercentFormatter}
                    width="15"
                    thStyle={tableHeaderStyle}
                />
            </BootstrapTable>
        );
    }
}
