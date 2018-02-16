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

    static addEnvironmentInLatencyCost(rawEdges) {
        return rawEdges.map(edge => ({
            from: {
                ...edge.from,
                environment: LatencyCost.toEnvironmentString(edge.from.infrastructureProvider, edge.from.infrastructureRegion)
            },
            to: {
                ...edge.to,
                environment: LatencyCost.toEnvironmentString(edge.to.infrastructureProvider, edge.to.infrastructureRegion)
            },
            networkDelta: edge.networkDelta
        }));
    }

    static getEnvironments(rawEdges) {
        const environments =
            _.uniqWith(
                _.flatten(rawEdges.map(edge =>
                    [
                        LatencyCost.toEnvironmentString(edge.to.infrastructureProvider, edge.to.infrastructureRegion),
                        LatencyCost.toEnvironmentString(edge.from.infrastructureProvider, edge.from.infrastructureRegion)
                    ])),
                _.isEqual
            );

        return environments.map((environment, index) => {
            if (environment === 'NA') {
                return {
                    environment: 'NA',
                    background: '#eee',
                    border: '#aaa'
                };
            }
            return {
                environment,
                background: backgroundColors[index % backgroundColors.length],
                border: borderColors[index % borderColors.length]
            };
        }).sort((e1, e2) => e1.environment.localeCompare(e2.environment));
    }

    static createNodes(rawEdges, environmentList) {
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
            const environmentWithColor = environmentList.find(en => en.environment === environment);

            return {
                ...node,
                id: index,
                label: `<b>${name}</b>\n${environment}`,
                color: {
                    background: environmentWithColor.background,
                    border: environmentWithColor.border,
                    hover: {
                        background: environmentWithColor.border,
                        border: environmentWithColor.border
                    }
                }
            };
        });
    }

    static createEdges(rawEdges, nodes) {
        return rawEdges.map((rawEdge) => {
            const fromIndex = nodes.find(node => node.name === rawEdge.from.serviceName && node.environment === rawEdge.from.environment).id;
            const toIndex = nodes.find(node => node.name === rawEdge.to.serviceName && node.environment === rawEdge.to.environment).id;

            const networkDelta = rawEdge.networkDelta && `${rawEdge.networkDelta}ms`;
            const isSameEnv = (rawEdge.from.environment === rawEdge.to.environment);
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
    }

    static calculateLatencySummary(rawEdges) {
        let networkTime = 0;
        let networkTimeCrossDc = 0;
        let calls = 0;
        let measuredCalls = 0;
        let crossDcCalls = 0;
        let crossDcMeasuredCalls = 0;

        rawEdges.forEach((edge) => {
            const networkDelta = edge.networkDelta ? edge.networkDelta : 0;
            const isMeasured = (edge.networkDelta !== null && edge.networkDelta !== undefined);
            const isSameEnv = (edge.from.environment === edge.to.environment);

            calls += 1;
            if (isMeasured) measuredCalls += 1;
            networkTime += networkDelta;
            if (!isSameEnv) {
                crossDcCalls += 1;
                networkTimeCrossDc += networkDelta;
                if (isMeasured) crossDcMeasuredCalls += 1;
            }
        });

        return {
            networkTime,
            networkTimeCrossDc,
            calls,
            measuredCalls,
            crossDcCalls,
            crossDcMeasuredCalls
        };
    }

    componentWillMount() {
        const latencyCostWithEnvironment = LatencyCost.addEnvironmentInLatencyCost(this.props.traceDetailsStore.latencyCost);
        const environmentList = LatencyCost.getEnvironments(latencyCostWithEnvironment);

        this.setState({latencyCostWithEnvironment, environmentList});
    }

    componentDidMount() {
        const {latencyCostWithEnvironment, environmentList} = this.state;

        const nodes = LatencyCost.createNodes(latencyCostWithEnvironment, environmentList);
        const edges = LatencyCost.createEdges(latencyCostWithEnvironment, nodes);
        const data = {nodes, edges};
        const container = this.graphContainer;
        const options = {
            autoResize: true,
            layout: {
                hierarchical: {
                    enabled: true,
                    sortMethod: 'directed'
                }
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
                hoverWidth: 0.5,
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

        // eslint-disable-next-line no-undef
        return new vis.Network(container, data, options);
    }

    render() {
        const {latencyCostWithEnvironment, environmentList} = this.state;
        const summary = LatencyCost.calculateLatencySummary(latencyCostWithEnvironment);

        const LatencySummary = () =>
            (<div className="well well-sm">
                <table className="latency-summary">
                    <tbody>
                    <tr>
                        <td>Network time</td>
                        <td>
                            <span className="latency-summary__primary-info">{summary.networkTime}ms</span>
                            <span>({summary.measuredCalls} measured out of {summary.calls} calls)</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Network time cross datacenters</td>
                        <td>
                            <span className="latency-summary__primary-info">{summary.networkTimeCrossDc}ms</span>
                            <span>({summary.crossDcMeasuredCalls} measured out of {summary.crossDcCalls} calls)</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Datacenters involved</td>
                        <td>
                            <span className="latency-summary__primary-info">{environmentList.length}</span>
                            <span>
                            {
                                environmentList && environmentList.map(
                                    environment => (
                                        <span
                                            key={Math.random()}
                                            className="dc-marker"
                                            style={{backgroundColor: environment.background, borderColor: environment.border }}
                                        >
                                            {environment.environment}
                                        </span>))
                            }
                            </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>);

        return (
            <article>
                <LatencySummary />
                <div ref={(node) => { this.graphContainer = node; }} style={{ height: '500px' }}/>
            </article>
        );
    }
}
