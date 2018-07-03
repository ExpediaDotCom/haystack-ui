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
import linkBuilder from '../../utils/linkBuilder';

export default class ServiceGraphResults extends React.Component {
    static propTypes = {
        serviceGraph: PropTypes.object.isRequired
    };
    static getErrorRateMap(rawEdges) {
        const errorCountsByVertex = new Map();
        _.forEach(rawEdges, (edge) => {
            if (errorCountsByVertex.get(edge.destination.name)) {
                const totalCnt = errorCountsByVertex.get(edge.destination.name).count + edge.stats.count;
                const errorCnt = errorCountsByVertex.get(edge.destination.name).errorCount + edge.stats.errorCount;
                errorCountsByVertex.set(edge.destination.name, { count: totalCnt, errorCount: errorCnt});
            } else {
                errorCountsByVertex.set(edge.destination.name, { count: edge.stats.count, errorCount: edge.stats.errorCount });
            }
        });
        // Fill in zero for vertex that are only in source but not in destination of a edge
        _.forEach(rawEdges, (edge) => {
           if (!errorCountsByVertex.get(edge.source.name)) {
               errorCountsByVertex.set(edge.source.name, {count: 0, errorCount: 0});
           }
        });
        return errorCountsByVertex;
    }

    static getNodeDisplayDetails(node, errorCountMap) {
        const errorRate = (errorCountMap.get(node).errorCount * 100) / (errorCountMap.get(node).count);
        const ERROR_LEVEL = 10;
        const WARN_LEVEL = 1;
        if (errorRate > ERROR_LEVEL) {
            return {level: 'danger', severity: 2, errorRate};
        } else if (errorRate > WARN_LEVEL) {
            return {level: 'warning', severity: 1, errorRate};
        }
        return {level: 'normal', severity: 0, errorRate};
    }

    static createNoticeContent(node, requestRate, errorPercent, level) {
        return `<table>
                    <tr>
                        <td class="vizceral-notice__title">Incoming rq :</td>
                        <td><b>${Number(requestRate).toFixed(2)}/sec</b></td>
                        <td class="vizceral-notice__traces-link">
                            <a href="${linkBuilder.createTracesLink({serviceName: node})}" target="_blank">
                                <span class="ti-new-window"></span> all traces
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="vizceral-notice__title">Error :</td>
                        <td class="vizceral-${level}"><b>${Number(errorPercent).toFixed(2)}%</b></td>
                        <td class="vizceral-notice__traces-link">
                            <a href="${linkBuilder.createTracesLink({serviceName: node})}?error=true" target="_blank">
                                <span class="ti-new-window"></span> error traces
                            </a>
                        </td>
                    </tr>
                </table>`;
    }

    static createNodes(rawEdges) {
        const allNodes = _.flatten(rawEdges.map((edge) => {
            const fromServiceName = edge.source.name;
            const toServiceName = edge.destination.name;
            return [fromServiceName, toServiceName];
        }));

        const uniqueNodes = _.uniqWith(allNodes, _.isEqual);
        const errorCountsByVertex = this.getErrorRateMap(rawEdges);
        return uniqueNodes.map((node) => {
            const nodeDisplayDetails = ServiceGraphResults.getNodeDisplayDetails(node, errorCountsByVertex);
            const nodeCount = errorCountsByVertex.get(node).count;
            return {
                name: node,
                class: nodeDisplayDetails.level,
                notices: [
                {
                    title: ServiceGraphResults.createNoticeContent(node, nodeCount, nodeDisplayDetails.errorRate || 0, nodeDisplayDetails.level),
                    severity: nodeDisplayDetails.severity
                }
            ],
                renderer: 'focusedChild'
            };
        });
    }

    static createEdges(rawEdges) {
        const edges = [];

        _.forEach(rawEdges, (rawEdge) => {
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

    render() {
        const serviceGraph = this.props.serviceGraph;
        const maxCountEdge = _.maxBy(serviceGraph, e => e.stats.count).stats.count;
        const nodes = ServiceGraphResults.createNodes(serviceGraph);
        const edges = ServiceGraphResults.createEdges(serviceGraph);
        config.nodes = nodes;
        config.connections = edges;
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
                <Vizceral traffic={config} view={['haystack']} styles={style} definitions={definitions} allowDraggingOfNodes targetFramerate={60} />
            </article>
        );
    }
}
