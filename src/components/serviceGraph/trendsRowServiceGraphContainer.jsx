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
import {inject, observer} from 'mobx-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ServiceGraphResults from './serviceGraphResults';
import Error from '../common/error';
import Loading from '../common/loading';
import Graph from './util/graph';

@inject('graphStore')
@observer
export default class TrendsRowServiceGraphContainer extends React.Component {
    static propTypes = {
        from: PropTypes.number.isRequired,
        to: PropTypes.number.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    static extractGraphForService(graphs, serviceName) {
        const result = _.find(graphs, graph => _.includes(Graph.buildGraph(graph).allNodes(), serviceName));
        return result;
    }

    constructor(props) {
        super(props);
        this.fetchServiceGraphs = this.fetchServiceGraphs.bind(this);
        this.fetchServiceGraphs();
    }

    fetchServiceGraphs() {
        const filterQuery = {
            from: this.props.from,
            to: this.props.to,
            serviceName: this.props.serviceName
        };
        this.props.graphStore.fetchServiceGraphForTimeline(filterQuery);
    }

    render() {
        return (
            <div className="col-md-12">
                <h5 className="text-center">Service Graph</h5>
                <div id="trend-row-container">
                     {this.props.graphStore.filteredGraphPromiseState && this.props.graphStore.filteredGraphPromiseState.case({
                    pending: () => <Loading/>,
                    rejected: () => <Error/>,
                    fulfilled: () => ((this.props.graphStore.filteredGraphs && this.props.graphStore.filteredGraphs.length)
                        ? <ServiceGraphResults serviceGraph={TrendsRowServiceGraphContainer.extractGraphForService(this.props.graphStore.filteredGraphs, this.props.serviceName)}/>
                        : <Error/>)
                })
                }
                </div>
            </div>
        );
    }
}
TrendsRowServiceGraphContainer.wrappedComponent.propTypes = {
    graphStore: PropTypes.object.isRequired
};
