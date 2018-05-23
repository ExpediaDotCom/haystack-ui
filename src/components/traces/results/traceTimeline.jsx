/*
 * Copyright 2018 Expedia, Inc.
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

import './traceTimeline.less';

@observer
export default class TraceTimeline extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.updateTimeFrame = this.updateTimeFrame.bind(this);
    }

    updateTimeFrame(event) {
        if (event.length) {
            const results = this.props.store.timelineResults;
            // eslint-disable-next-line no-underscore-dangle
            const startTime = results[event[0]._index].x * 1000;
            const granularity = (results[results.length - 1].x - results[0].x) / 15;
            const endTime = (startTime + (granularity * 1000));

            const newQuery = {
                serviceName: this.props.store.searchQuery.serviceName,
                startTime,
                endTime
            };

            this.props.store.fetchSearchResults(newQuery);
        }
    }

    render() {
        const labels = [];
        const data = [];
        this.props.store.timelineResults.forEach((item) => {
            labels.push(new Date(item.x));
            data.push(item.y);
        });

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'traces count',
                    backgroundColor: '#D8ECFA',
                    borderColor: '#36A2EB',
                    borderWidth: 1,
                    hoverBackgroundColor: '#73bdef',
                    hoverBorderColor: '#36A2EB',
                    data
                }
            ]
        };
        const options = {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    barPercentage: 1.17,
                    type: 'time',
                    time: {
                        min: this.props.store.searchQuery.startTime / 1000,
                        max: this.props.store.searchQuery.endTime / 1000
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
