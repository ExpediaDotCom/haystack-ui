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
import options from './options';

const backgroundColor = [['rgba(75, 192, 192, 0.2)']];
const borderColor = [['rgba(75, 192, 192, 1)']];
const successChartOptions = _.cloneDeep(options);
successChartOptions.scales.yAxes = [{
    display: true,
    ticks: {
        beginAtZero: true,
        max: 100
    }
}];

const SuccessGraph = ({successCount, failureCount}) => {
    const data = _.flatMap(failureCount, ((failItem) => {
        const successItem = _.find(successCount, x => (x.timestamp === failItem.timestamp));
        if (successItem) {
            return {
                x: new Date(failItem.timestamp),
                y: (100 - ((failItem.value / (successItem.value + failItem.value)) * 100)).toFixed(3)
            };
        }
        return null;
    }));
    const chartData = {
        datasets: [{
            label: 'Success %',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1
        }],
        fill: 'end'
    };

    return (<div className="col-md-12">
            <h5 className="text-center">Success %</h5>
            <div className="chart-container">
                <Line data={chartData} options={successChartOptions} type="line" />
            </div>
        </div>
    );
};

SuccessGraph.propTypes = {
    successCount: PropTypes.object.isRequired,
    failureCount: PropTypes.object.isRequired
};

export default SuccessGraph;
