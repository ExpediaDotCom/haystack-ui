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

const {expect} = require('chai');
const base = require('../../../server/config/base');

describe('base configuration', () => {
    describe('serviceInsights configuration', () => {
        const spanTypes = base.connectors.serviceInsights.spanTypes;
        it('handles default spanType `edge`', () => {
            const mockSpan = {
                serviceName: 'edge',
                tags: []
            };
            const mockSpan2 = {
                serviceName: 'edge',
                tags: [
                    {
                        key: 'edge.route',
                        value: 'edgeFoo'
                    }
                ]
            };
            expect(spanTypes.edge.isType(mockSpan)).to.equal(true);
            expect(spanTypes.edge.nodeId(mockSpan)).to.equal('edge');
            expect(spanTypes.edge.nodeName(mockSpan)).to.equal('edge');
            expect(spanTypes.edge.nodeId(mockSpan2)).to.equal('edgeFoo');
            expect(spanTypes.edge.nodeName(mockSpan2)).to.equal('edgeFoo');
        });

        it('handles default spanType `gateway`', () => {
            const mockSpan = {
                serviceName: 'gateway',
                tags: []
            };
            const mockSpan2 = {
                serviceName: 'gateway',
                tags: [
                    {
                        key: 'gateway.destination',
                        value: 'gatewayFoo'
                    }
                ]
            };
            const mockSpan3 = {
                serviceName: 'gateway',
                tags: [
                    {
                        key: 'app.datacenter',
                        value: 'gatewayBar'
                    }
                ]
            };
            expect(spanTypes.gateway.isType(mockSpan)).to.equal(true);
            expect(spanTypes.gateway.nodeId(mockSpan)).to.equal('gateway');
            expect(spanTypes.gateway.nodeName(mockSpan)).to.equal('gateway');
            expect(spanTypes.gateway.nodeId(mockSpan2)).to.equal('gatewayFoo');
            expect(spanTypes.gateway.nodeName(mockSpan3)).to.equal('gatewayBar');
        });
    });
});
