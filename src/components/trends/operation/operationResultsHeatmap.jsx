/*
 * Copyright 2019 Expedia Group
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
import moment from 'moment';

import './operationResultsHeatmap.less';

const percentColors = [
    {pct: 0.0, color: {r: 140, g: 40, b: 39}},
    {pct: 0.5, color: {r: 179, g: 77, b: 75}},
    {pct: 0.75, color: {r: 236, g: 139, b: 131}},
    {pct: 0.9, color: {r: 246, g: 198, b: 181}},
    {pct: 0.95, color: {r: 245, g: 255, b: 211}},
    {pct: 0.98, color: {r: 209, g: 230, b: 204}},
    {pct: 0.99, color: {r: 165, g: 206, b: 185}},
    {pct: 0.999, color: {r: 118, g: 182, b: 163}},
    {pct: 1.0, color: {r: 75, g: 157, b: 147}}
];

export default class OperationResultsHeatmap extends React.Component {
    static propTypes = {
        operationStore: PropTypes.object.isRequired
    };

    static getColorForPercentage(pct) {
        let i;
        for (i = 1; i < percentColors.length - 1; i++) {
            if (pct < percentColors[i].pct) {
                break;
            }
        }
        const lower = percentColors[i - 1];
        const upper = percentColors[i];
        const range = upper.pct - lower.pct;
        const rangePct = (pct - lower.pct) / range;
        const pctLower = 1 - rangePct;
        const pctUpper = rangePct;
        const color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return `rgb(${[color.r, color.g, color.b].join(',')})`;
    }

    static getColumnHeaders(from, until, granularity) {
        const headers = [];
        let i = 0;
        const fromRounded = Math.ceil(moment(from) / granularity) * granularity;
        do {
            const timestamp = fromRounded + granularity * i;
            headers.push(timestamp);
            i += 1;
        } while (headers[headers.length - 1] < until);
        return headers;
    }

    static coloumnHeaderFormatter(timestamp) {
        return moment(timestamp).format('lll');
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const data = this.props.operationStore.statsResults;
        const {from, until, granularity} = this.props.operationStore.statsQuery;
        const columnHeaders = OperationResultsHeatmap.getColumnHeaders(from, until, granularity);
        return (
            <section>
                <div className="heatmap-container">
                    <table className="heatmap">
                        <thead>
                            <tr>
                                <th />
                                {columnHeaders.map((header) => (
                                    <th>
                                        <div>
                                            <span>{OperationResultsHeatmap.coloumnHeaderFormatter(header)}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((op) => (
                                <tr>
                                    <th>{op.operationName}</th>
                                    {/* {op.successPercentPoints.map((successPercentDatapoint) => (
                                        <td
                                            style={{
                                                background: successPercentDatapoint.value
                                                    ? OperationResultsHeatmap.getColorForPercentage(successPercentDatapoint.value / 100)
                                                    : '#f9edf3'
                                            }}
                                        >
                                            {successPercentDatapoint.value}
                                        </td>
                                    ))} */}
                                    {columnHeaders.map((headerTimestamp, index) => {
                                        const availableDatapoint = op.successPercentPoints.find(
                                            (sucessPercentDatapoint) =>
                                                sucessPercentDatapoint.timestamp >= headerTimestamp &&
                                                sucessPercentDatapoint.timestamp < columnHeaders[index + 1]
                                        );
                                        return availableDatapoint ? (
                                            <td style={{background: OperationResultsHeatmap.getColorForPercentage(availableDatapoint.value / 100)}}>
                                                {availableDatapoint.value} %
                                            </td>
                                        ) : (
                                            <td style={{background: '#f9edf3'}} />
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}
