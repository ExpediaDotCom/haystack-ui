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
import _ from 'lodash';

import formatters from '../../../../utils/formatters';
import options from './options';
import MissingTrendGraph from './missingTrend';

const backgroundColor = [['rgba(54, 162, 235, 0.2)']];
const borderColor = [['rgba(54, 162, 235, 1)']];

const countChartOptions = _.cloneDeep(options);

countChartOptions.scales.yAxes = [{
    display: true,
    ticks: {
        callback(value) {
            const formattedValue = formatters.toNumberString(value);
            if (formattedValue.length < 8) {
                return `${' '.repeat(8 - formattedValue.length)}${formattedValue}`;
            }
            return formattedValue;
        }
    }
}];

const CountGraph = ({points}) => {
    const data = points.map(point => ({x: new Date(point.timestamp), y: point.value}));

    if (!data.length) {
        return (<MissingTrendGraph title="Count"/>);
    }

    const chartData = {
        datasets: [{
            label: 'Count    ',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1
        }]
    };

    return (<div className="col-md-12">
            <h5 className="text-center">Count</h5>
            <div className="chart-container">
                <Line data={chartData} options={countChartOptions} type="line" />
            </div>
        </div>
    );
};

CountGraph.propTypes = {
    points: PropTypes.object.isRequired
};

export default CountGraph;
