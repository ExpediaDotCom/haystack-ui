/*
 * Copyright 2017 Expedia, Inc.
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
/* eslint-disable no-unused-expressions */

import axios from 'axios';
import {observable, action} from 'mobx';

const colors = [
    '#4B7B4B',
    '#2574A9',
    '#886288',
    '#8D6708',
    '#AA5535',
    '#8b0000',
    '#5a781d',
    '#336e7b',
    '#3c1362',
    '#4b6a88',
    '#806c00',
    '#914f15',
    '#5c0819',
    '#008040',
    '#406098',
    '#8859b6',
    '#4d6066',
    '#856514',
    '#80503d',
    '#32050e',
    '#007a7c',
    '#3455db',
    '#7659b6',
    '#4f5a65',
    '#726012',
    '#aa2e00',
    '#923026'
];

// TODO: Refactor this method so it doesn't break ESLint
function mapToColor(services) {
    let index = 0;
    return services.reduce((acc, svc) => {
        acc[svc] = colors[index];
        index >= colors.length ? index = 0 : index += 1;
        return acc;
    }, {});
}

export class ServiceStore {
    @observable services = [];
    @observable servicesWithColor = {};
    @action fetchServices() {
        axios({
            method: 'get',
            url: '/api/services'
        })
            .then((response) => {
                this.services = response.data;
                this.servicesWithColor = mapToColor(this.services);
            });
    }
}

export default new ServiceStore();
