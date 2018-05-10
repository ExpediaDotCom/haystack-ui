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

export default class ServiceGraphResults extends React.Component {
    static propTypes = {
        serviceGraph: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    static createNodes(rawEdges) {
        const allNodes = _.flatten(rawEdges.map((edge) => {
            const fromServiceName = edge.source;

            const toServiceName = edge.destination;

            return [{name: fromServiceName}, {name: toServiceName}];
        }));

        const uniqueNodes = _.uniqWith(allNodes, _.isEqual);

        return uniqueNodes.map((node, index) => {
            const name = node.name;

            return {
                ...node,
                id: index,
                label: `${name}`,
                title: `${name}`,
                color: {
                    background: '#D8ECFA',
                    border: '#36A2EB'
                }
            };
        });
    }

    static createEdges(rawEdges, nodes) {
        const edges = [];
        rawEdges.forEach((rawEdge) => {
            const fromIndex = nodes.find(node => node.name === rawEdge.source).id;
            const toIndex = nodes.find(node => node.name === rawEdge.destination).id;
            edges.push({
                from: fromIndex,
                to: toIndex,
                color: {
                    color: '#333333',
                    hover: '#333333'
                }
            });
        });
        return edges;
    }

    componentDidMount() {
        const serviceGraph = this.props.serviceGraph;
        const nodes = ServiceGraphResults.createNodes(serviceGraph);
        const edges = ServiceGraphResults.createEdges(serviceGraph, nodes);
        const data = {nodes, edges};
        const container = this.graphContainer;
        const options = {
            autoResize: true,
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'LR',
                    blockShifting: true,
                    edgeMinimization: true,
                    sortMethod: 'directed',
                    levelSeparation: 250
                }
            },
            interaction: {
                selectable: true,
                zoomView: true,
                dragView: true,
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
                    size: 12
                }
            },
            edges: {
                smooth: false,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5
                    }
                },
                hoverWidth: 0.5,
                color: {
                    color: '#333333'
                }
            },
            physics: {
                hierarchicalRepulsion: {
                    centralGravity: 0.0,
                    springLength: 50,
                    nodeDistance: 50
                }
            }
        };

        // eslint-disable-next-line no-undef
        const network = new vis.Network(container, data, options);

        network.on('click', (properties) => {
            const nodeIndex = properties.nodes[0];
            const node = nodes[nodeIndex];
            if (node) this.props.history.push(`/service/${encodeURIComponent(node.name)}/trends`);
        });
        return network;
    }

    render() {
        return (
            <article className="serviceGraph__panel">
                <div ref={(node) => { this.graphContainer = node; }} style={{ height: '600px' }}/>
            </article>
        );
    }
}
