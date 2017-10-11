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
import {Line} from 'react-chartjs-2';
import PropTypes from 'prop-types';

const backgroundColor = [['rgba(54, 162, 235, 0.2)']];
const borderColor = [['rgba(54, 162, 235, 1)']];

const CountGraph = ({points}) => {
    const data = points.map(point => ({x: point.timestamp, y: point.value % 100000}));
    const labels = points.map(point => point.timestamp % 100000); // TODO convert timestamp to time text and reduce number of labels

    const chartData = {
        labels,
        datasets: [{
            label: 'Count',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1
        }]
    };

    return (<div className="col-md-4">
            <h5 className="text-center">Invocation Count</h5>
            <div className="chart-container">
                <Line data={chartData} options={{maintainAspectRatio: false}} type="line" />
            </div>
        </div>
    );
};

CountGraph.propTypes = {
    points: PropTypes.object.isRequired
};

export default CountGraph;
