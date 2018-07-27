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
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

import Loading from '../../common/loading';
import ServiceResultsTable from './serviceResultsTable';
import './serviceResults.less';
import Error from '../../common/error';


@observer
export default class ServiceResults extends React.Component {
    static propTypes = {
        serviceStore: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    render() {
        return (
            <section className="service-results">
                <div className="results-table-heading">Summary</div>
                { this.props.serviceStore.statsPromiseState && this.props.serviceStore.statsPromiseState.case({
                    empty: () => <Loading />,
                    pending: () => <Loading />,
                    rejected: () => <Error errorMessage={''} />,
                    fulfilled: () => ((this.props.serviceStore.statsResults && this.props.serviceStore.statsResults.length)
                        ? <ServiceResultsTable
                            serviceStore={this.props.serviceStore}
                            location={this.props.location}
                            serviceName={this.props.serviceName}
                        />
                        : <Error errorMessage={''} />)
                })
                }
            </section>
        );
    }
}

