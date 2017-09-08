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
    '#e23474',
    '#FF00FF',
    '#f2b632',
    '#DEB887',
    '#51b0c5',
    '#e51c23',
    '#cf38a3',
    '#2b98f0',
    '#4CAF50',
    '#4B0082',
    '#AFEEEE',
    '#FFFF00',
    '#BC8F8F',
    '#006400',
    '#0000FF',
    '#FFD700',
    '#2F4F4F',
    '#7FFFD4',
    '#DB7093',
    '#FF6347',
    '#7FFF00',
    '#B8860B',
    '#FF69B4',
    '#7de0a6',
    '#2a2c43'
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
