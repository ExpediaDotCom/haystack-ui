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

import Loading from '../common/loading';
import ServiceGraphResults from './serviceGraphResults';
import Error from '../common/error';

@observer
export default class ServiceGraphContainer extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

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
                <div className="clearfix">
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
                                            <a role="button" className="serviceGraph__tab-link" tabIndex="-1" onClick={() => this.toggleTab(index + 1)} >{graph[0].source}</a>
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
