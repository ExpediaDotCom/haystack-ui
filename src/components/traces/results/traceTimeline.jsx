/*
 * Copyright 2018 Expedia Group
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
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {Bar} from 'react-chartjs-2';
import {toQueryUrlString} from '../../../utils/queryParser';
import { convertSearchToUrlQuery } from '../../universalSearch/utils/urlUtils';

import './traceTimeline.less';

@observer
export default class TraceTimeline extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
        isUniversalSearch: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.updateTimeFrame = this.updateTimeFrame.bind(this);
    }

    updateTimeFrame(event) {
        if (event.length) {
            const results = this.props.store.timelineResults;

            // this means we reached lowest granularity, couldn't go further down
            if (results.length === 2) return;

            // eslint-disable-next-line no-underscore-dangle
            const selectedIndex = event[0]._index;
            const startTime = results[selectedIndex].x / 1000;
            const granularityMs = (results[1].x - results[0].x) / 1000;
            const endTime = startTime + granularityMs;

            let queryUrl = '';
            if (this.props.isUniversalSearch) {
                const newSearch = {
                    ...this.props.store.searchQuery,
                    timePreset: null,
                    startTime: null,
                    endTime: null,
                    time: {
                        from: startTime,
                        to: endTime
                    }
                };

                queryUrl = `?${convertSearchToUrlQuery(newSearch)}`;
            } else {
                const newQuery = {
                    ...this.props.store.searchQuery,
                    timePreset: null,
                    startTime,
                    endTime
                };

                queryUrl = `?${toQueryUrlString(newQuery)}`;
            }
            this.props.history.push({
                search: queryUrl
            });
        }
    }

    render() {
        const labels = [];
        const data = [];
        this.props.store.timelineResults.forEach((item) => {
            labels.push(new Date(item.x / 1000));
            data.push(item.y);
        });

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'traces count',
                    backgroundColor: '#78c5f9',
                    borderColor: '#36A2EB',
                    borderWidth: 1,
                    hoverBackgroundColor: '#b5def7',
                    hoverBorderColor: '#36A2EB',
                    data
                }
            ]
        };
        const options = {
            maintainAspectRatio: false,
            barThickness: 1,
            gridLines: {
                offsetGridLines: true
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.95,
                    type: 'time',
                    ticks: {
                        source: 'data'
                    },
                    time: {
                        min: new Date(parseInt(this.props.store.apiQuery.startTime, 10) / 1000),
                        max: new Date(parseInt(this.props.store.apiQuery.endTime, 10) / 1000)
                    },
                    categoryPercentage: 1,
                    gridLines: {
                        offsetGridLines: true
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        };

        return (
            <div className="trace-timeline-container">
                <Bar data={chartData} height={150} options={options} getElementAtEvent={this.updateTimeFrame}/>
            </div>
        );
    }
}
