/*
 * Copyright 2018 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Loading from '../common/loading';
import ServiceGraphResults from './serviceGraphResults';
import Error from '../common/error';

@observer
export default class ServiceGraphContainer extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    /**
     *
     * @param graph
     * @returns {*}
     * Find the root node for the graph tab. For this we need to find all the nodes with no incoming edges. From that
     * list we will pick the node with the largest outgoing traffic.ser
     */
    static findRootNode(graph) {
        const dest = _.map(graph, edge => edge.destination.name);
        const rootNodes = [];
        _.forEach(graph, (edge) => {
            if (!_.includes(dest, edge.source.name)) {
                rootNodes.push(edge.source.name);
            }
        });
        const uniqRoots = _.uniq(rootNodes);
        const sortedRoots = _.sortBy(uniqRoots, (node) => {
            const outgoingEdges = _.filter(graph, edge => edge.source.name === node);
            return _.reduce(outgoingEdges, (result, val) => val.stats.count + result, 0);
        });
        return _.last(sortedRoots);
    }

    constructor(props) {
        super(props);

        this.state = {
            tabSelected: 1
        };
        this.toggleTab = this.toggleTab.bind(this);
        this.props.store.fetchServiceGraph();
    }

    toggleTab(tabIndex) {
        this.props.store.fetchServiceGraph();
        this.setState({tabSelected: tabIndex});
    }

render() {
        return (
            <section className="container">
                <div className="clearfix" id="service-graph">
                    <div className="serviceGraph__header-title pull-left">
                        <span>Service Graph </span>
                        <span className="h6">(will show list of partial graphs if missing data from services)</span>
                    </div>
                    <div className="serviceGraph__tabs pull-right">
                        <ul className="nav nav-tabs">
                            {
                                this.props.store.graphs.map(
                                    (graph, index) => (
                                        <li className={this.state.tabSelected === (index + 1) ? 'active ' : ''}>
                                            <a role="button" className="serviceGraph__tab-link" tabIndex="-1" onClick={() => this.toggleTab(index + 1)} >{ServiceGraphContainer.findRootNode(graph)}</a>
                                        </li>
                                    )
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div>
                { this.props.store.promiseState && this.props.store.promiseState.case({
                    pending: () => <Loading />,
                    rejected: () => <Error />,
                    fulfilled: () => ((this.props.store.graphs && this.props.store.graphs.length)
                        ? <ServiceGraphResults serviceGraph={this.props.store.graphs[this.state.tabSelected - 1]} history={this.props.history} />
                        : <Error />)
                })
                }
                </div>
            </section>
        );
    }
}
