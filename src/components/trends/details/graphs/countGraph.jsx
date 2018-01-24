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

const backgroundColorSuccess = [['rgba(156, 98, 250, 0']];
const borderColorSuccess = [['rgba(156, 98, 250, 1)']];

const backgroundColorTotal = [['rgba(54, 162, 235, 0.2)']];
const borderColorTotal = [['rgba(54, 162, 235, 1)']];

const backgroundColorFailure = [['rgba(229, 28, 35, 0)']];
const borderColorFailure = [['rgba(229, 28, 35, 1)']];

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

const CountGraph = ({countPoints, successPoints, failurePoints}) => {
    const total = countPoints.map(point => ({x: new Date(point.timestamp), y: point.value}));
    const successData = successPoints.map(point => ({x: new Date(point.timestamp), y: point.value}));
    const failureData = failurePoints.map(point => ({x: new Date(point.timestamp), y: point.value}));

    if (!total.length && !successData && !failureData) {
        return (<MissingTrendGraph title="Count"/>);
    }

    const chartData = {
        datasets: [
            {
                label: 'Failure    ',
                data: failureData,
                backgroundColor: backgroundColorFailure,
                borderColor: borderColorFailure,
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 3
            },
            {
                label: 'Success    ',
                data: successData,
                backgroundColor: backgroundColorSuccess,
                borderColor: borderColorSuccess,
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 3
            },
            {
                label: 'Total     ',
                data: total,
                backgroundColor: backgroundColorTotal,
                borderColor: borderColorTotal,
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 3
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
    countPoints: PropTypes.object.isRequired,
    successPoints: PropTypes.object.isRequired,
    failurePoints: PropTypes.object.isRequired
};

export default CountGraph;
