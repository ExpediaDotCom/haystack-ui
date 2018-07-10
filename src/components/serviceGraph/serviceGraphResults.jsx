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
import Vizceral from 'vizceral-react';

import config from './vizceralConfig';
import NodeDetails from './nodeDetails';
import Graph from './util/graph';
import ConnectionDetails from './connectionDetails';

export default class ServiceGraphResults extends React.Component {
    static propTypes = {
        serviceGraph: PropTypes.object.isRequired
    };

    static getNodeDisplayDetails(errorRate) {
        const ERROR_LEVEL = 10;
        const WARN_LEVEL = 1;
        if (errorRate > ERROR_LEVEL) {
            return {level: 'danger', severity: 2, errorRate};
        } else if (errorRate > WARN_LEVEL) {
            return {level: 'warning', severity: 1, errorRate};
        }
        return {level: 'normal', severity: 0, errorRate};
    }

    static createNoticeContent(requestRate, errorPercent, level) {
        return `<table>
                    <tr>
                        <td class="vizceral-notice__title">Incoming rq :</td>
                        <td><b>${Number(requestRate).toFixed(2)}/sec</b></td>
                    </tr>
                    <tr>
                        <td class="vizceral-notice__title">Error :</td>
                        <td class="vizceral-${level}"><b>${Number(errorPercent).toFixed(2)}%</b></td>
                    </tr>
                </table>`;
    }

    static createNodes(graph) {
        return graph.allNodes().map((node) => {
            const nodeDisplayDetails = ServiceGraphResults.getNodeDisplayDetails(graph.errorRateForNode(node));
            return {
                name: node,
                class: nodeDisplayDetails.level,
                notices: [
                    {
                        title: ServiceGraphResults.createNoticeContent(graph.requestRateForNode(node), graph.errorRateForNode(node), nodeDisplayDetails.level),
                        severity: nodeDisplayDetails.severity
                    }
                ],
                renderer: 'focusedChild'
            };
        });
    }

    static createConnections(graph) {
        const edges = [];

        _.forEach(graph.allEdges(), (rawEdge) => {
            edges.push({
                source: rawEdge.source.name,
                target: rawEdge.destination.name,
                metrics: {
                    normal: rawEdge.stats.count - rawEdge.stats.errorCount,
                    danger: rawEdge.stats.errorCount
                }
            });
        });
        return edges;
    }

    static buildGraph = (rawEdges) => {
        const graph = new Graph();
        _.forEach(rawEdges, (edge) => {
            graph.addEdge(edge);
        });
        return graph;
    }

    constructor(props) {
        super(props);
        this.state = {
            nodeDetails: undefined,
            connDetails: undefined
        };
    }

    onNodeDetailsClose = () => {
        this.setState({nodeDetails: undefined});
    };

    onConnectionDetailsClose = () => {
        this.setState({connDetails: undefined});
    };
    objectHighlighted = (highlightedObject) => {
        if (typeof highlightedObject === 'undefined') {
            return;
        }
        if (highlightedObject.type === 'node') {
            this.setState({nodeDetails: highlightedObject.getName()});
        } else {
            this.setState({connDetails: highlightedObject.getName()});
        }
    };

    render() {
        const serviceGraph = this.props.serviceGraph;
        const maxCountEdge = _.maxBy(serviceGraph, e => e.stats.count).stats.count;
        const graph = ServiceGraphResults.buildGraph(serviceGraph);
        const nodeDetails = this.state.nodeDetails;
        const connDetails = this.state.connDetails;
        config.nodes = ServiceGraphResults.createNodes(graph);
        config.connections = ServiceGraphResults.createConnections(graph);
        config.maxVolume = maxCountEdge * 20;

        const blue = '#479fd6';
        const darkGrey = '#2d3750';
        const white = '#ffffff';
        const brandPrimary = '#e23474';
        const warning = '#e98c15';
        const grey = '#777';

        const definitions = {
            detailedNode: {
                volume: {
                    focused: {
                        top: {header: 'Rq/Sec'},
                        bottom: {header: 'Error Rate'}
                    }
                }
            }
        };

        const style = {
            colorLabelText: white,
            colorNormalDimmed: brandPrimary,
            colorBackgroundDark: darkGrey,
            colorLabelBorder: darkGrey,
            colorDonutInternalColor: white,
            colorDonutInternalColorHighlighted: darkGrey,
            colorConnectionLine: grey,
            colorBorderLines: grey,
            colorNodeStatus: {
                default: darkGrey
            },
            colorTraffic: {
                normal: blue,
                normalDonut: darkGrey,
                warning
            },
            colorTrafficHighlighted: {
                normal: grey
            }
        };

        return (
            <article className="serviceGraph__panel">
                <Vizceral
                    traffic={config}
                    view={['haystack']}
                    styles={style}
                    definitions={definitions}
                    allowDraggingOfNodes
                    targetFramerate={60}
                    objectHighlighted={this.objectHighlighted}
                />
                {
                    !!nodeDetails &&
                    <NodeDetails
                        requestRate={graph.requestRateForNode(nodeDetails)}
                        errorPercent={graph.errorRateForNode(nodeDetails)}
                        onClose={this.onNodeDetailsClose}
                        incomingEdges={graph.incomingTrafficForNode(nodeDetails)}
                        outgoingEdges={graph.outgoingTrafficForNode(nodeDetails)}
                        tags={graph.tagsForNode(nodeDetails)}
                    />
                }
                {
                    !!connDetails &&
                    <ConnectionDetails
                        requestRate={graph.errorRateForConnection(connDetails.split('--')[0], connDetails.split('--')[1])}
                        errorPercent={graph.requestRateForConnection(connDetails.split('--')[0], connDetails.split('--')[1])}
                        onClose={this.onConnectionDetailsClose}
                    />
                }
            </article>
        );
    }
}
