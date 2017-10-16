/*
 * Copyright 2017 Expedia, Inc.
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
import {observer} from 'mobx-react';

import TrendDetailsToolbar from './trendDetailsToolbar';
import GraphContainer from './graphs/graphContainer';
import Error from '../../common/error';
import Loading from '../../common/loading';
import './trendDetails.less';

@observer
export default class TrendResultExpand extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired,
        opName: PropTypes.string.isRequired
    }
    componentDidMount() {
        this.props.store.fetchTrendDetailResults(this.props.serviceName, this.props.opName, 'asdf');
    }

    render() {
        return (
            <div className="table-row-details">
                <TrendDetailsToolbar trendsSearchStore={this.props.store} serviceName={this.props.serviceName} opName={this.props.opName} />
                { this.props.store.detailsPromiseState && this.props.store.detailsPromiseState.case({
                    empty: () => <Loading />,
                    pending: () => <Loading />,
                    rejected: () => <Error />,
                    fulfilled: () => (this.props.store.trendResults && Object.keys(this.props.store.trendResults).length ?
                        <GraphContainer store={this.props.store} /> :
                        <Error />)

                })
                }
            </div>
        );
    }
}
