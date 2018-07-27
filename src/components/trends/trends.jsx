/* eslint-disable react/prefer-stateless-function */
/*
 * Copyright 2018 Expedia Group
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
import PropTypes from 'prop-types';

import TrendsHeader from './trendsHeader';
import OperationResults from './operation/operationResults';
import ServiceResults from './service/serviceResults';
import operationStore from './stores/operationStore';
import serviceStore from './stores/serviceStore';

const enableServiceLevelTrends = (window.haystackUiConfig.enableServiceLevelTrends);

export default class Trends extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {serviceName: this.props.match.params.serviceName};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({serviceName: nextProps.match.params.serviceName});
    }

    render() {
        const { location, history } = this.props;
        return (
            <section className="trends-panel">
                <TrendsHeader
                    operationStore={operationStore}
                    serviceStore={serviceStore}
                    serviceName={this.state.serviceName}
                    location={location}
                    history={history}
                />
                {
                    enableServiceLevelTrends &&
                    <ServiceResults
                        serviceStore={serviceStore}
                        serviceName={this.state.serviceName}
                        location={location}
                    />
                }
                <OperationResults
                    operationStore={operationStore}
                    serviceName={this.state.serviceName}
                    location={location}
                />
            </section>

        );
    }
}
