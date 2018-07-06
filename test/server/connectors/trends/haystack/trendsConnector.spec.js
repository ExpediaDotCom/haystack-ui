/*
 * Copyright 2018 Expedia, Inc.
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


import {expect} from 'chai';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const trendsConnector = require('../../../../../server/connectors/trends/haystack/trendsConnector');

const server = new MockAdapter(axios);
server.onGet('undefined/render?target=haystack.serviceName.*.interval.OneMinute.stat.{count}.{success-span}&from=1530828169&to=1530829069').reply(200, []);
server.onGet('undefined/render?target=haystack.serviceName.*.interval.OneMinute.stat.{count}.{failure-span}&from=1530828169&to=1530829069').reply(200, []);
server.onGet('undefined/render?target=haystack.serviceName.*.interval.OneMinute.stat.{*_99}.{duration}&from=1530828169&to=1530829069').reply(200, []);

describe('trendsConnector', () => {
    it('encodes and decodes correctly', () => trendsConnector.getServicePerfStats(3000, 1530828169000, 1530829069000).then(result => expect(result).to.be.empty));
});
