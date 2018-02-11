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
import {Network} from 'vis';

// import { Network } from 'vis/index-network'; // Works, but breaks tests due to import issue. Package size is much smaller with this import.

const borderColors = [
    '#36A2EB',
    '#FF6384',
    '#ff9f40',
    '#4BC0C0'
];
const backgroundColors = [
    '#D8ECFA',
    '#FEB2C2',
    '#FFECDB',
    '#DCF2F2'
];

@observer
export default class LatencyCost extends React.Component {
    static propTypes = {
        traceDetailsStore: PropTypes.object.isRequired
    };

    static toEnvironmentString(infrastructureProvider, infrastructureRegion) {
        return (infrastructureProvider || infrastructureRegion) ? `${infrastructureProvider} ${infrastructureRegion}` : 'NA';
    }

    static createEnvColorMap(rawEdges) {
        const environments =
            _.uniqWith(
                _.flatten(rawEdges.map(edge =>
                    [
                        LatencyCost.toEnvironmentString(edge.to.infrastructureProvider, edge.to.infrastructureRegion),
                        LatencyCost.toEnvironmentString(edge.from.infrastructureProvider, edge.from.infrastructureRegion)
                    ])),
                _.isEqual
            );

        const colorMap = {};
        environments.forEach((environment, index) => {
            if (environment === 'NA') {
                colorMap.NA = {
                    background: '#eee',
                    border: '#aaa',
                    hover: {
                        background: '#aaa',
                        border: '#aaa'
                    }
                };
            } else {
                colorMap[environment] = {
                    background: backgroundColors[index % backgroundColors.length],
                    border: borderColors[index % borderColors.length],
                    hover: {
                        background: borderColors[index % borderColors.length],
                        border: borderColors[index % borderColors.length]
                    }
                };
            }
        });

        return colorMap;
    }

    static createNodes(rawEdges, environmentMap) {
        const allNodes = _.flatten(rawEdges.map((edge) => {
            const fromEnv = LatencyCost.toEnvironmentString(edge.from.infrastructureProvider, edge.from.infrastructureRegion);
            const fromServiceName = edge.from.serviceName;

            const toEnv = LatencyCost.toEnvironmentString(edge.to.infrastructureProvider, edge.to.infrastructureRegion);
            const toServiceName = edge.to.serviceName;

            return [{environment: fromEnv, name: fromServiceName}, {environment: toEnv, name: toServiceName}];
        }));

        const uniqueNodes = _.uniqWith(allNodes, _.isEqual);

        return uniqueNodes.map((node, index) => {
            const {environment, name} = node;

            return {
                ...node,
                id: index,
                label: `<b>${name}</b>\n${environment}`,
                color: environmentMap[environment]
            };
        });
    }

    static createEdges(rawEdges, nodes) {
        const edges = rawEdges.map((rawEdge) => {
            const fromName = rawEdge.from.serviceName;
            const fromEnv = LatencyCost.toEnvironmentString(rawEdge.from.infrastructureProvider, rawEdge.from.infrastructureRegion);
            const fromIndex = nodes.find(node => node.name === fromName && node.environment === fromEnv).id;

            const toName = rawEdge.to.serviceName;
            const toEnv = LatencyCost.toEnvironmentString(rawEdge.to.infrastructureProvider, rawEdge.to.infrastructureRegion);
            const toIndex = nodes.find(node => node.name === toName && node.environment === toEnv).id;

            const networkDelta = rawEdge.networkDelta ? `${rawEdge.networkDelta}ms` : '';
            const isSameEnv = (fromEnv === toEnv);

            return {
                from: fromIndex,
                to: toIndex,
                label: networkDelta,
                color: {
                    color: isSameEnv ? '#333333' : '#dd0000',
                    hover: isSameEnv ? '#333333' : '#dd0000'
                }
            };
        });

        return _.uniqWith(edges, _.isEqual);
    }

    componentDidMount() {
        const environmentMap = LatencyCost.createEnvColorMap(this.props.traceDetailsStore.latencyCost);
        const nodes = LatencyCost.createNodes(this.props.traceDetailsStore.latencyCost, environmentMap);
        const edges = LatencyCost.createEdges(this.props.traceDetailsStore.latencyCost, nodes);
        const data = {nodes, edges};

        const container = document.getElementById('latencyGraph');
        const options = {
            autoResize: true,
            layout: {
                hierarchical: true
            },
            interaction: {
                selectable: false,
                zoomView: false,
                dragView: false,
                hover: true
            },
            nodes: {
                shape: 'box',
                margin: {
                    left: 10,
                    right: 10,
                    bottom: 10
                },
                font: {
                    multi: true,
                    face: 'Titillium Web',
                    size: 12,
                    bold: {
                        size: 14
                    }
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5
                    }
                },
                hoverWidth: 0.4,
                font: {
                    background: '#ffffff',
                    face: 'Titillium Web',
                    size: 12
                },
                color: {
                    color: '#333333'
                }
            }
        };

        return new Network(container, data, options);
    }

    render() {
        return (
            <article>
                <div id="latencyGraph" style={{ height: '500px' }}/>
            </article>
        );
    }
}
