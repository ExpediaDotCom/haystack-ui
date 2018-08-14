/*
 * Copyright 2018 Expedia Group
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
import {PropTypes as MobxPropTypes} from 'mobx-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Vizceral from 'vizceral-react';

import config from './vizceralConfig';
import Graph from './util/graph';
import ConnectionDetails from './connectionDetails';
import './serviceGraph.less';
import ServiceGraphSearch from './graphSearch';
import linkbuilder from '../../utils/linkBuilder';
import NodeDetails from './nodeDetails';

export default class ServiceGraphResults extends React.Component {
    static propTypes = {
        serviceGraph: PropTypes.oneOfType([
            MobxPropTypes.observableArray.isRequired,
            PropTypes.array
        ]).isRequired,
        search: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
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

    static createNoticeContent(node, incomingEdges) {
        let incomingEdgesList = ['<tr><td>NA</td><td/><td/></tr>'];

        if (incomingEdges.length) {
            incomingEdgesList = incomingEdges.sort((a, b) => b.stats.count - a.stats.count).map((e) => {
                const errorPercentage = (e.stats.errorCount * 100) / e.stats.count;
                const level = ServiceGraphResults.getNodeDisplayDetails(errorPercentage);
                return `
                    <tr>
                        <td>${e.source.name}</td>
                        <td class="text-right">${e.stats.count.toFixed(2)}</td>
                        <td class="text-right service-graph__info-error-${level.level}">${errorPercentage.toFixed(2)}%</td>
                    </tr>`;
            });
        }

        return `
                <h5>Traffic in <b>${node}</b></h5>
                <div class="text-muted">(last 1 hour average)</div>
                <table class="service-graph__info-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th class="text-right">Rq/Sec</th>
                            <th class="text-right">Error%</th>
                        </tr>
                    </thead>
                    <tbody>${incomingEdgesList.join('')}</tbody>
                </table>
            `;
    }

    static createNodes(graph) {
        return graph.allNodes().map((node) => {
            const nodeDisplayDetails = ServiceGraphResults.getNodeDisplayDetails(graph.errorRateForNode(node));
            return {
                name: node,
                class: nodeDisplayDetails.level,
                notices: [
                    {
                        title: ServiceGraphResults.createNoticeContent(node, graph.incomingTrafficForNode(node)),
                        severity: nodeDisplayDetails.severity
                    }
                ]
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
            connDetails: undefined,
            searchString: ''
        };
    }

    onConnectionDetailsClose = () => {
        this.setState({connDetails: undefined});
    };
    objectHighlighted = (highlightedObject) => {
        if (typeof highlightedObject === 'undefined') {
            return;
        }
        if (highlightedObject.type === 'node') {
            const search = this.props.search;
            search.serviceName = highlightedObject.getName();
            this.props.history.push(linkbuilder.universalSearchServiceGraphLink(search));
            return;
        }
        this.setState({connDetails: highlightedObject.getName()});
        this.setState({searchString: ''});
    };
    searchStringChanged = (newVal) => {
        this.setState({
            searchString: newVal
        });
    };

    render() {
        const serviceGraph = this.props.serviceGraph;
        const maxCountEdge = _.maxBy(serviceGraph, e => e.stats.count).stats.count;
        const graph = ServiceGraphResults.buildGraph(serviceGraph);
        const connDetails = this.state.connDetails;
        config.nodes = ServiceGraphResults.createNodes(graph);
        config.connections = ServiceGraphResults.createConnections(graph);
        config.maxVolume = maxCountEdge * 1000;

        const blue = '#3c86b4';
        const darkGrey = '#2d3750';
        const white = '#ffffff';
        const brandPrimary = '#e23474';
        const warning = '#e98c15';
        const grey = '#bbb';
        const serviceName = this.props.search.serviceName;

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
            <div>
                {
                    !!serviceName &&
                    <NodeDetails
                        serviceName={serviceName}
                        requestRate={graph.requestRateForNode(serviceName)}
                        errorPercent={graph.errorRateForNode(serviceName)}
                        incomingEdges={graph.incomingTrafficForNode(serviceName)}
                        outgoingEdges={graph.outgoingTrafficForNode(serviceName)}
                        tags={graph.tagsForNode(serviceName)}
                    />
                }
                <article className="serviceGraph__panel">
                    <ServiceGraphSearch searchStringChanged={this.searchStringChanged} searchString={this.state.searchString} />
                    <Vizceral
                        traffic={config}
                        view={['haystack']}
                        styles={style}
                        definitions={definitions}
                        allowDraggingOfNodes
                        targetFramerate={60}
                        objectHighlighted={this.objectHighlighted}
                        match={this.state.searchString}
                        viewChanged={this.setView}
                    />
                    {
                        !!connDetails &&
                        <ConnectionDetails
                            requestRate={graph.requestRateForConnection(connDetails.split('--')[0], connDetails.split('--')[1])}
                            errorPercent={graph.errorRateForConnection(connDetails.split('--')[0], connDetails.split('--')[1])}
                            onClose={this.onConnectionDetailsClose}
                        />
                    }
                </article>
            </div>
        );
    }
}
