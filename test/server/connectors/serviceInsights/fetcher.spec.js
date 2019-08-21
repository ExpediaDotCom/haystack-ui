/*
 * Copyright 2019 Expedia Group
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

const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock trace data
// Initialized in `beforeEach()` during unit test
let mockTraces = null;
let mockRawTraces = null;

// Create mock logger
const logger = sinon.spy();

// Create mock metrics
const metrics = {
    timer: () => metrics,
    start: () => metrics,
    end: () => metrics
};

const metricsTimerSpy = sinon.spy(metrics, 'timer');
const metricsStartSpy = sinon.spy(metrics, 'start');
const metricsStopSpy = sinon.spy(metrics, 'end');

// Create mock tracesConnector
const tracesConnector = {
    findTraces: () =>
        new Promise((resolve) => {
            resolve(mockTraces);
        }),
    getRawTraces: () =>
        new Promise((resolve) => {
            resolve(mockRawTraces);
        })
};

const fetcher = proxyquire('../../../../server/connectors/serviceInsights/fetcher', {
    '../../config/config': {
        connectors: {
            traces: {
                connectorName: 'stub'
            },
            serviceInsights: {
                traceLimit: 1000
            }
        }
    },
    '../../connectors/traces/stub/tracesConnector': tracesConnector,
    '../../utils/logger': logger,
    '../../utils/metrics': metrics
});

describe('fetcher.fetch', () => {
    beforeEach(() => {
        mockTraces = [];
        mockRawTraces = [];
        metricsTimerSpy.reset();
        metricsStartSpy.reset();
        metricsStopSpy.reset();
        logger.reset();
    });

    it('should return 0 spans given 0 traces', (done) => {
        // given
        const {fetch} = fetcher('service_insights');

        // when
        fetch('mock-service', '1000', '2000')
            .then((result) => {
                // then
                expect(result.serviceName).to.equal('mock-service');
                expect(metricsTimerSpy.calledWith('fetcher_service_insights')).to.equal(true);
                expect(result.spans).to.be.empty;
                expect(result.traceLimitReached).to.be.false;
                done();
            })
            .done();
    });

    it('should return 0 spans given null traces', (done) => {
        // given
        mockTraces = false;
        const {fetch} = fetcher('service_insights');

        // when
        fetch('mock-service', '1000', '2000')
            .then((result) => {
                // then
                expect(result.serviceName).to.equal('mock-service');
                expect(metricsTimerSpy.calledWith('fetcher_service_insights')).to.equal(true);
                expect(result.spans.length).to.equal(0);
                done();
            })
            .done();
    });

    it('should return 1 spans given 1 trace', (done) => {
        // given
        mockTraces = [
            {
                traceId: 1
            }
        ];
        mockRawTraces = [
            {
                traceId: 1,
                spanId: 1
            }
        ];
        const {fetch} = fetcher('service insights');

        // when
        fetch('mock-service', '1000', '2000', 1)
            .then((result) => {
                // then
                expect(result.serviceName).to.equal('mock-service');
                expect(result.spans.length).to.equal(1);
                expect(result.traceLimitReached).to.be.true;
                done();
            })
            .done();
    });
});
