/*
 * Copyright 2018 Expedia Group
 *
 *       Licensed under the Apache License, Version 2.0 (the License);
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an AS IS BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */
/* eslint-disable max-len */

import {expect} from 'chai';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const trendsConnector = require('../../../../../server/connectors/trends/haystack/trendsConnector');


describe('trendsConnector', () => {
    let server;

    before(() => {
        server = new MockAdapter(axios);
        server.onGet("undefined/render?target=seriesByTag('name%3D%7Bsuccess-span%7D'%2C'mtype%3Dgauge'%2C'product%3Dhaystack'%2C'serviceName%3D*'%2C'interval%3DOneMinute'%2C'stat%3D%7Bcount%7D'%2C'unit%3D%7Bshort%7D')&from=1530828169&to=1530829069").reply(200, []);
        server.onGet("undefined/render?target=seriesByTag('name%3D%7Bfailure-span%7D'%2C'mtype%3Dgauge'%2C'product%3Dhaystack'%2C'serviceName%3D*'%2C'interval%3DOneMinute'%2C'stat%3D%7Bcount%7D'%2C'unit%3D%7Bshort%7D')&from=1530828169&to=1530829069").reply(200, []);
        server.onGet("undefined/render?target=seriesByTag('name%3D%7Bduration%7D'%2C'mtype%3Dgauge'%2C'product%3Dhaystack'%2C'serviceName%3D*'%2C'interval%3DOneMinute'%2C'stat%3D%7B*_99%7D'%2C'unit%3D%7Bmicroseconds%7D')&from=1530828169&to=1530829069").reply(200, []);
    });

    after(() => {
        server = null;
    });

    it('encodes and decodes correctly', () => trendsConnector.getServicePerfStats(3000, 1530828169000, 1530829069000).then(result => expect(result).to.be.empty));
});
