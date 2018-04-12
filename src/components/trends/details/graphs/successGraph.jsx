/*
 * Copyright 2018 Expedia, Inc.
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
import MissingTrendGraph from './missingTrend';

const backgroundColor = [['rgba(75, 192, 192, 0.2)']];
const borderColor = [['rgba(75, 192, 192, 1)']];
const successChartOptions = _.cloneDeep(options);

successChartOptions.scales.yAxes = [{
    display: true,
    ticks: {
        max: 100,
        callback(value) {
            const fixedValue = value.toFixed(3);
            return `${' '.repeat(8 - fixedValue.toString().length)}${fixedValue}`;
        }
    }
}];

const SuccessGraph = ({successCount, failureCount, ambiguousCount, from, until}) => {
    const successTimestamps = successCount.map(point => point.timestamp);
    const failureTimestamps = failureCount.map(point => point.timestamp);
    const ambiguousTimestamps = ambiguousCount.map(point => point.timestamp);
    const timestamps = _.uniq([...successTimestamps, ...failureTimestamps, ...ambiguousTimestamps]);

    const data = _.compact(timestamps.map((timestamp) => {
        const successItem = _.find(successCount, x => (x.timestamp === timestamp));
        const successVal = (successItem && successItem.value && successItem.value !== null) ? successItem.value : 0;

        const failureItem = _.find(failureCount, x => (x.timestamp === timestamp));
        const failureVal = (failureItem && failureItem.value && failureItem.value !== null) ? failureItem.value : 0;

        const ambiguousItem = _.find(ambiguousCount, x => (x.timestamp === timestamp));
        const ambiguousVal = (ambiguousItem && ambiguousItem.value && ambiguousItem.value !== null) ? ambiguousItem.value : 0;

        if (successVal + failureVal + ambiguousVal) {
            return {
                x: new Date(timestamp),
                y: (100 - (((failureVal + ambiguousVal) / (successVal + failureVal + ambiguousVal)) * 100)).toFixed(3)
            };
        }
        return null;
    }));

    if (!data.length) {
        return (<MissingTrendGraph title="Success %"/>);
    }

    successChartOptions.scales.xAxes = [{
        type: 'time',
        time: {
            min: new Date(from),
            max: new Date(until)
        }
    }];

    const chartData = {
        datasets: [{
            label: 'Success %',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
            pointRadius: 1,
            pointHoverRadius: 3
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
    failureCount: PropTypes.object.isRequired,
    ambiguousCount: PropTypes.object.isRequired,
    from: PropTypes.number.isRequired,
    until: PropTypes.number.isRequired
};

export default SuccessGraph;
