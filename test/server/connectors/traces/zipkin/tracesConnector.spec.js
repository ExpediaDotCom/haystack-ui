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
import {expect} from 'chai';

const axios = require('axios');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// loads the tracesConnector, but allowing us to override the configuration
function tracesConnector(config) {
  return proxyquire('../../../../../server/connectors/traces/zipkin/tracesConnector', {
      '../../../config/config': config
  });
}

// TODO: migrate to v2 https://github.com/ExpediaDotCom/haystack-ui/issues/396
const zipkinUrl = 'http://localhost/api/v1';
const config = {connectors: {traces: {zipkinUrl}, trends: {connectorName: 'stub'}}};

describe('tracesConnector.getServices', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => sandbox.restore());

  // When an HTTP GET is invoked, this returns the supplied data as a response.
  function stubGetReturns(data) {
    const resolved = new Promise(r => r({ data }));
    return sandbox.stub(axios, 'get').returns(resolved);
  }

  it('should not error when empty', (done) => {
    stubGetReturns([]);

    tracesConnector(config).getServices().then((result) => {
      expect(result).to.have.length(0);
    }).then(done, done);
  });

  it('should call correct URL', (done) => {
    const spy = stubGetReturns([]);

    tracesConnector(config).getServices().then(() => {
      expect(spy.args[0][0]).to.equal('http://localhost/api/v1/services');
    }).then(done, done);
  });

  it('should not filter out services when servicesFilter is unconfigured', (done) => {
    stubGetReturns(['frontend', 'backend']);

    tracesConnector(config).getServices().then((result) => {
      expect(result).to.deep.equal(['frontend', 'backend']);
    }).then(done, done);
  });

  it('should not filter out services when empty servicesFilter is configured', (done) => {
    stubGetReturns(['frontend', 'backend']);

    config.connectors.traces.servicesFilter = [];
    tracesConnector(config).getServices().then((result) => {
      expect(result).to.deep.equal(['frontend', 'backend']);
    }).then(done, done);
  });
  
  it('should filter out services that match regex servicesFilter', (done) => {
    stubGetReturns([
        'value-1',
        '$/special/values',
        '#/special/.values',
        'values'
    ]);

    config.connectors.traces.servicesFilter = [new RegExp('value')];
    tracesConnector(config).getServices().then((result) => {
      expect(result.length).to.equal(0); // all service names contain 'value'
    }).then(done, done);
  });

  it('should filter out services that match any regex servicesFilter', (done) => {
    stubGetReturns([
        'value-1',
        '$/special/values',
        '#/special/.values',
        'values'
    ]);

    config.connectors.traces.servicesFilter = [new RegExp('special'), new RegExp('-1')];
    tracesConnector(config).getServices().then((result) => {
      expect(result).to.deep.equal(['values']);
    }).then(done, done);
  });

  it('should filter out services that match regex servicesFilter - special character', (done) => {
    stubGetReturns([
        'value-1',
        '$/special/values',
        '#/special/.values',
        'values'
    ]);

    config.connectors.traces.servicesFilter = [new RegExp('^\\$/special/.*$')];
    tracesConnector(config).getServices().then((result) => {
      expect(result).to.deep.equal([
          'value-1',
          '#/special/.values',
          'values'
      ]);
    }).then(done, done);
  });
});
