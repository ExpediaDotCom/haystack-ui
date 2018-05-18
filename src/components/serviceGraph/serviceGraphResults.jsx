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

export default class ServiceGraphResults extends React.Component {
    static propTypes = {
        serviceGraph: PropTypes.object.isRequired
    };

    static createNodes(rawEdges) {
        const allNodes = _.flatten(rawEdges.map((edge) => {
            const fromServiceName = edge.source;

            const toServiceName = edge.destination;

            return [{name: fromServiceName}, {name: toServiceName}];
        }));

        const uniqueNodes = _.uniqWith(allNodes, _.isEqual);

        return uniqueNodes.map((node) => {
            const name = node.name;

            return {
                name,
                renderer: 'focusedChild'
            };
        });
    }

    static createEdges(rawEdges) {
        const edges = [];
        const maxCountEdge = _.maxBy(rawEdges, e => e.count);
        const denominator = maxCountEdge.count / 10000;

        rawEdges.forEach((rawEdge) => {
            edges.push({
                source: rawEdge.source,
                target: rawEdge.destination,
                metrics: {
                    normal: (rawEdge.count / denominator)
                }
            });
        });
        return edges;
    }

    render() {
        const serviceGraph = this.props.serviceGraph;
        const nodes = ServiceGraphResults.createNodes(serviceGraph);
        const edges = ServiceGraphResults.createEdges(serviceGraph);
        config.nodes = nodes;
        config.connections = edges;
        const style = {
            colorLabelText: 'rgb(255, 255, 255)',
            colorTextDisabled: 'rgb(45, 55, 80)',
            colorNormalDimmed: 'rgb(45, 55, 80)',
            colorBackgroundDark: 'rgb(45, 55, 80)',
            colorLabelBorder: 'rgba(54, 162, 235, 1)',
            colorDonutInternalColor: 'rgb(45, 55, 80)',
            colorDonutInternalColorHighlighted: 'rgb(45, 55, 80)',
            colorConnectionLine: 'rgb(45, 55, 80)',
            colorPageBackground: 'rgb(45, 55, 80)',
            colorPageBackgroundTransparent: 'rgb(45, 55, 80)',
            colorBorderLines: 'rgba(54, 162, 235, 1)',
            colorArcBackground: 'rgb(45, 55, 80)',
            colorNodeStatus: {
                default: 'rgb(45, 55, 80)',
                normal: 'rgb(127, 255, 0)',
                warning: 'rgb(268, 185, 73)',
                danger: 'rgb(255, 53, 53)'
            },
            colorTraffic: {
                normal: 'rgb(75, 192, 192)',
                normalDonut: 'rgb(45, 55, 80)',
                warning: 'rgb(268, 185, 73)',
                danger: 'rgb(184, 36, 36)'
            }
        };
        return (
            <article className="serviceGraph__panel">
                <Vizceral traffic={config} view={['haystack']} styles={style} />
            </article>
        );
    }
}
