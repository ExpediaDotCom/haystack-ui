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

import options from './options';

const backgroundColor = [['rgba(75, 192, 192, 0.2)']];
const borderColor = [['rgba(75, 192, 192, 1)']];

const SuccessGraph = ({successCount, failureCount}) => {
    // TODO make sure that success count and failure counts are merging on the right timestamps
    const data = failureCount.map((items, index) => ({
        x: new Date(items.timestamp / 1000),
        y: (items.value / (successCount[index].value + items.value)) * 100
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

    return (<div className="col-md-4">
            <h5 className="text-center">Success %</h5>
            <div className="chart-container">
                <Line data={chartData} options={options} type="line" />
            </div>
        </div>
    );
};

SuccessGraph.propTypes = {
    successCount: PropTypes.object.isRequired,
    failureCount: PropTypes.object.isRequired
};

export default SuccessGraph;
