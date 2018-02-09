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
import _ from 'lodash';
import {observer} from 'mobx-react';
import { Network } from 'vis/index-network';

@observer
export default class LatencyCost extends React.Component {
    static propTypes = {
        traceDetailsStore: PropTypes.object.isRequired
    };

    static getBackgroundColor(provider) {
        const background = provider === 'aws' ? '#ff9330' : '#80C2F2';
        const border = provider === 'aws' ? '#ad5c14' : '#2c73a5';
        return {background, border};
    }

    static createItems(data) {
        const flatMap = _.flatten(data.map((entry) => {
            const fromEnv = `${entry[1].from.infrastructureProvider} ${entry[1].from.infrastructureRegion}`;
            const toEnv = `${entry[1].to.infrastructureProvider} ${entry[1].to.infrastructureRegion}`;
            const fromColor = LatencyCost.getBackgroundColor(entry[1].from.infrastructureProvider);
            const toColor = LatencyCost.getBackgroundColor(entry[1].to.infrastructureProvider);
            const fromServiceName = entry[1].from.serviceName;
            const toServiceName = entry[1].to.serviceName;
            return [{serviceProviderRegion: fromEnv, name: fromServiceName, color: fromColor}, {serviceProviderRegion: toEnv, name: toServiceName, color: toColor}];
        }));
        return _.uniqWith(flatMap, _.isEqual);
    }

    static createEdges(data, items) {
        const edges = data.map((entry) => {
            const matchFromName = entry[1].from.serviceName;
            const matchFromEnv = `${entry[1].from.infrastructureProvider} ${entry[1].from.infrastructureRegion}`;
            const matchToName = entry[1].to.serviceName;
            const matchToEnv = `${entry[1].to.infrastructureProvider} ${entry[1].to.infrastructureRegion}`;
            const networkDelta = entry[1].networkDelta ? `${entry[1].networkDelta}ms` : '';
            const matchFromIndex = items.findIndex(item => item.name === matchFromName && item.serviceProviderRegion === matchFromEnv);
            const matchToIndex = items.findIndex(item => item.name === matchToName && item.serviceProviderRegion === matchToEnv);
            return {from: matchFromIndex, to: matchToIndex, label: networkDelta};
        });
        return _.uniqWith(edges, _.isEqual);
    }

    static createNodes(items) {
        return items.map((node, i) => {
            const {serviceProviderRegion, name, color} = node;
            const shape = 'box';
            const id = i;
            const label = serviceProviderRegion ? [name, serviceProviderRegion].join('\n') : name;
            return {id, label, shape, color};
        });
    }

    componentDidMount() {
        const items = LatencyCost.createItems(this.props.traceDetailsStore.latencyCost);
        const edges = LatencyCost.createEdges(this.props.traceDetailsStore.latencyCost, items);
        const nodes = LatencyCost.createNodes(items);
        const container = document.getElementById('latencyGraph');
        const data = {nodes, edges};
        const options = {layout: {hierarchical: true}, interaction: {zoomView: false, dragView: false, click: false}};
        return new Network(container, data, options);
    }

    render() {
        return (
            <div>
                <div id="latencyGraph" style={{ height: '500px' }}/>
            </div>
        );
    }
}
