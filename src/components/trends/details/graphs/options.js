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

import {Chart} from 'react-chartjs-2';

Chart.defaults.global.defaultFontFamily = 'monospace';

export default {
    maintainAspectRatio: false,
    legend: {
        position: 'right'
    },
    scales: {
        xAxes: [{
            type: 'time'
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
};
