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
import {Sparklines, SparklinesCurve, SparklinesSpots} from 'react-sparklines';

import '../operation/operationResultsTable.less';

import formatters from '../../../utils/formatters';

export default class TrendsTableFormatters {

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

    static durationColumnFormatter(cell, row) {
        const values = [];
        row.tp99Duration.map(d => values.push(d.value));

        return (<div className="sparkline-container">
            { cell !== null ?
                <div className="sparkline-title">
                    latest duration <b>{formatters.toDurationStringFromMs(cell)}</b>
                </div>
                : null}
            <div className="sparkline-graph">
                <Sparklines className="sparkline" data={values} min={0} height={48}>
                    <SparklinesCurve style={{ strokeWidth: 1 }} color="#e23474" />
                    <SparklinesSpots />
                </Sparklines>
            </div>
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

    static sortByPercentage(a, b, order) {
        if (order === 'desc') {
            return b.successPercent - a.successPercent;
        }
        return a.successPercent - b.successPercent;
    }

    static enrichTrends(serviceTrends) {
        return serviceTrends.map((opTrends) => {
            const lastPoint = opTrends.tp99Duration[opTrends.tp99Duration.length - 1];

            return {
                ...opTrends,
                lastTp99Duration: lastPoint ? lastPoint.value / 1000 : null
            };
        });
    }

}

