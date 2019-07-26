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
import {extractNodesAndLinks} from '../../../../server/connectors/serviceInsights/graphDataExtractor';

/* eslint-disable no-unused-expressions */
describe('graphDataExtractor.extractNodesAndLinks', () => {
    function randomId() {
        return Math.floor(Math.random() * 10000);
    }

    function trace(...spans) {
        const traceId = randomId();

        spans.forEach((s, i) => {
            s.traceId = traceId;
            if (i > 0) {
                s.parentSpanId = spans[i - 1].spanId;
            }
        });

        return spans;
    }

    function span(serviceName, operationName, tags = []) {
        const spanId = randomId();
        return {
            spanId,
            serviceName,
            operationName,
            tags
        };
    }

    /*
     * The following span functions must match the server/config/base.js configuration for spanTypes.
     */

    function edgeSpan() {
        // edge routes a request
        return span('edge', 'edge route');
    }

    function gatewaySpan() {
        // gateway routes a request
        return span('gateway', 'gateway route');
    }

    function uiAppSpan() {
        // some-ui-app receives a request as a server
        return span('some-ui-app', 'serve ui operation', [{key: 'span.kind', value: 'server'}]);
    }

    function clientSpan() {
        // some-ui-app makes a client call to some-other-server
        return span('some-ui-app', 'ui client', [{key: 'span.kind', value: 'client'}]);
    }

    function serverSpan() {
        // some-backend-server receives a request
        return span('some-backend-server', 'backend operation', [{key: 'span.kind', value: 'server'}]);
    }

    function meshSpan() {
        // mesh routes a request
        return span('service-mesh', 'mesh route');
    }

    function databaseSpan() {
        // some-backend-server's span from its nosql database client query
        return span('some-backend-server', 'SELECT *', [{key: 'db.type', value: 'nosql'}]);
    }

    function mergedSpan() {
        // merge of some-ui-app (client) calling some-backend-server (server)
        // essentially this is a merge of clientSpan() and serverSpan()
        return span('some-backend-server', 'ui client + backend operation', [
            {key: 'X-HAYSTACK-IS-MERGED-SPAN', value: true},
            {key: 'span.kind', value: 'client'},
            {key: 'span.kind', value: 'server'}
        ]);
    }

    it('should have a summary of traces considered', () => {
        // given
        const spans = [...trace(uiAppSpan(), serverSpan()), ...trace(uiAppSpan(), serverSpan(), databaseSpan())];

        // when
        const {summary} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(summary).to.have.property('tracesConsidered', 2);
        expect(summary).to.have.property('hasViolations', false);
    });

    it('should return some nodes', () => {
        // given
        const spans = [...trace(edgeSpan(), uiAppSpan(), mergedSpan()), ...trace(uiAppSpan(), meshSpan(), serverSpan(), databaseSpan())];

        // when
        const {nodes} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(nodes)
            .to.be.an('array')
            .with.lengthOf(5);
    });

    it('should find uninstrumented nodes', () => {
        // given
        const spans = [
            ...trace(uiAppSpan(), serverSpan()), // ok
            ...trace(uiAppSpan(), mergedSpan()), // ok
            ...trace(uiAppSpan(), clientSpan()), // uninstrumented
            ...trace(uiAppSpan(), meshSpan()) // uninstrumented
        ];

        // when
        const {summary} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(summary).to.have.property('hasViolations', true);
        expect(summary).to.have.nested.property('violations.uninstrumented', 2);
    });

    it('should return some links', () => {
        // given
        const spans = trace(edgeSpan(), gatewaySpan(), uiAppSpan(), serverSpan(), databaseSpan());

        // when
        const {links} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(links)
            .to.be.an('array')
            .with.lengthOf(4);
    });

    it('should link source and target nodes', () => {
        // given
        const spans = trace(uiAppSpan(), serverSpan());

        // when
        const {links} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(links).to.have.lengthOf(1);
        expect(links[0]).to.have.property('source', 'some-ui-app');
        expect(links[0]).to.have.property('target', 'some-backend-server');
    });

    it('should count occurrence of nodes and links', () => {
        // given
        const spans = [...trace(edgeSpan(), uiAppSpan()), ...trace(edgeSpan(), uiAppSpan(), databaseSpan())];

        // when
        const {nodes, links} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(nodes.find((n) => n.type === 'edge')).to.have.property('count', 2);
        expect(nodes.find((n) => n.type === 'database')).to.have.property('count', 1);
        expect(links.find((e) => e.target === 'some-ui-app')).to.have.property('count', 2);
        expect(links.find((e) => e.source === 'some-ui-app')).to.have.property('count', 1);
    });

    it('should gracefully handle missing parent spans', () => {
        // given
        const spans = trace(uiAppSpan());
        spans[0].parentSpanId = randomId(); // missing parent span

        // when
        const {summary, nodes, links} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(summary).to.have.property('hasViolations', false);
        expect(nodes)
            .to.be.an('array')
            .with.lengthOf(1);
        expect(links).to.be.an('array').that.is.empty;
    });

    it('should gracefully handle parent-child spans that become the same node', () => {
        // given
        const spans = trace(uiAppSpan(), meshSpan(), meshSpan(), serverSpan()); // mesh spans will become one node

        // when
        const {summary, nodes, links} = extractNodesAndLinks({spans, serviceName: 'some-ui-app'});

        // then
        expect(summary).to.have.property('hasViolations', false);
        expect(nodes)
            .to.be.an('array')
            .with.lengthOf(3);
        expect(links)
            .to.be.an('array')
            .with.lengthOf(2);
    });

    it('should detect cycles in the graph', () => {
        // given
        const spans = trace(span('server A', 'calls B'), span('server B', 'calls C'), span('server C', 'calls A'));
        spans[0].parentSpanId = spans[2].spanId; // nice little loop

        // when
        const {links, summary} = extractNodesAndLinks({spans, serviceName: 'some-service'});

        // then
        expect(summary).to.have.property('hasViolations', true);
        expect(summary).to.have.nested.property('violations.cycles', 1);
        expect(links).to.have.lengthOf(3);
        links.forEach((link) => {
            expect(link).to.have.property('invalidCycleDetected', true);
        });
    });
});
