/*
 * Copyright 2018 Expedia, Inc.
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
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import vis from 'vis';

@observer
export default class LatencyCost extends React.Component {
    static propTypes = {
        traceDetailsStore: PropTypes.object.isRequired
    };

    static createNodes(data) {
        const nodes = [];
        data.forEach((entry) => {
            const fromServiceName = entry[1].from.serviceName;
            const toServiceName = entry[1].to.serviceName;
            const fromEnv = `${entry[1].from.infrastructureProvider} ${entry[1].from.infrastructureRegion}`;
            const toEnv = `${entry[1].to.infrastructureProvider} ${entry[1].to.infrastructureRegion}`;

            if (!nodes.find(item => item.label[0] === fromServiceName && item.label[1] === fromEnv)) {
                nodes.push({id: nodes.length, label: [fromServiceName, fromEnv], shape: 'box'});
            }
            if (!nodes.find(item => item.label[0] === toServiceName && item.label[1] === toEnv)) {
                nodes.push({id: nodes.length, label: [toServiceName, toEnv], shape: 'box'});
            }
        });
        return nodes;
    }

    static createEdges(data, nodes) {
        const edges = [];
        data.forEach((entry) => {
            const matchFromLabel = entry[1].from.serviceName;
            const matchFromEnv = `${entry[1].from.infrastructureProvider} ${entry[1].from.infrastructureRegion}`;
            const matchToLabel = entry[1].to.serviceName;
            const matchToEnv = `${entry[1].to.infrastructureProvider} ${entry[1].to.infrastructureRegion}`;
            const networkDelta = entry[1].networkDelta ? `${entry[1].networkDelta}ms` : '';
            const matchFromIndex = nodes.findIndex(item => item.label[0] === matchFromLabel && item.label[1] === matchFromEnv);
            const matchToIndex = nodes.findIndex(item => item.label[0] === matchToLabel && item.label[1] === matchToEnv);
            edges.push({from: matchFromIndex, to: matchToIndex, label: networkDelta});
        });
        return edges;
    }

    componentDidMount() {
        const nodes = LatencyCost.createNodes(this.props.traceDetailsStore.latencyCost);
        const edges = LatencyCost.createEdges(this.props.traceDetailsStore.latencyCost, nodes);
        nodes.map((node) => {
            node.label = node.label.join('\n'); // eslint-disable-line
            return node;
        });
        const container = document.getElementById('latencyGraph');
        const data = {nodes, edges};
        const options = {layout: {hierarchical: true}, edges: {color: '#000000'}};
        const network = new vis.Network(container, data, options); // eslint-disable-line
    }

    render() {
        return (
            <div>
                <div id="latencyGraph" style={{ height: '500px' }}/>
            </div>
        );
    }
}
