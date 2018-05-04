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

export default class FlowResultsGraph extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    static createNodes(rawEdges) {
        const allNodes = _.flatten(rawEdges.map((edge) => {
            const fromServiceName = edge.graphEdge.source;

            const toServiceName = edge.graphEdge.destination;

            return [{name: fromServiceName}, {name: toServiceName}];
        }));

        const uniqueNodes = _.uniqWith(allNodes, _.isEqual);

        return uniqueNodes.map((node, index) => {
            const name = node.name;

            return {
                ...node,
                id: index,
                label: `<b>${name}</b>`,
                color: {
                    background: '#F7B0C9',
                    border: '#EC3F7C'
                }
            };
        });
    }

    static createEdges(rawEdges, nodes) {
        const edges = [];
        rawEdges.forEach((rawEdge) => {
            const fromIndex = nodes.find(node => node.name === rawEdge.graphEdge.source).id;
            const toIndex = nodes.find(node => node.name === rawEdge.graphEdge.destination).id;
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
        const serviceGraph = this.props.store.serviceGraph;
        const nodes = FlowResultsGraph.createNodes(serviceGraph);
        const edges = FlowResultsGraph.createEdges(serviceGraph, nodes);
        const data = {nodes, edges};
        const container = this.graphContainer;
        const options = {
            autoResize: true,
            layout: {
                hierarchical: {
                    enabled: true,
                    blockShifting: true,
                    edgeMinimization: true,
                    sortMethod: 'directed',
                    levelSeparation: 80
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
                    size: 12,
                    bold: {
                        size: 14
                    }
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
                font: {
                    background: '#ffffff',
                    face: 'Titillium Web',
                    size: 15
                },
                color: {
                    color: '#333333'
                }
            },
            physics: {
                hierarchicalRepulsion: {
                    centralGravity: 0.0,
                    springLength: 50,
                    nodeDistance: 100
                }
            }
        };

        // eslint-disable-next-line no-undef
        const network = new vis.Network(container, data, options);

        network.on('click', (properties) => {
            const nodeIndex = properties.nodes[0];
            const node = nodes[nodeIndex];
            node ? this.props.history.push(`/service/${encodeURIComponent(node.name)}/trends`) : null;
        });
        return network;
    }

    render() {
        return (
            <article>
                <div ref={(node) => { this.graphContainer = node; }} style={{ height: '500px' }}/>
            </article>
        );
    }
}
