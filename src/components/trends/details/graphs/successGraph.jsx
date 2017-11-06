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
import trendsCommon from '../../utils/trendsCommon';

const backgroundColor = [['rgba(75, 192, 192, 0.2)']];
const borderColor = [['rgba(75, 192, 192, 1)']];

const SuccessGraph = ({successCount, failureCount}) => {
    let data;
    let graph;
    if (successCount && successCount.length && failureCount && failureCount.length) {
        // TODO make sure that success count and failure counts are merging on the right timestamps
        data = failureCount.map((items, index) => ({
            x: new Date(items.timestamp),
            y: (100 - ((items.value / (successCount[index].value + items.value)) * 100)).toFixed(3)
        }));
    }

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

    if (data) {
        graph = (
            <div className="chart-container">
                <Line data={chartData} options={options} type="line"/>
            </div>
        );
    } else {
        graph = trendsCommon.displayNoDataPoints();
    }

    return (<div className="col-md-12">
            <h5 className="text-center">Success %</h5>
            {graph}
        </div>
    );
};

SuccessGraph.propTypes = {
    successCount: PropTypes.object.isRequired,
    failureCount: PropTypes.object.isRequired
};

export default SuccessGraph;
