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
import Select from 'react-select';

@observer
export default class ServicePicker extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        serviceStore: PropTypes.object.isRequired
    };

    static convertToValueLabelMap(serviceList) {
        return serviceList.map(service => ({value: service, label: service}));
    }

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.serviceStore.fetchServices();
    }

    handleChange(event) {
        this.props.uiState.setServiceName(event.value);
    }

    render() {
        const serviceName = this.props.uiState.serviceName;

        // default to current service if there is not operation in store
        const options = this.props.serviceStore.services.length
            ? ServicePicker.convertToValueLabelMap(this.props.serviceStore.services)
            : ServicePicker.convertToValueLabelMap([serviceName]);

        return (
            <div className="search-bar-pickers_service">
                <Select
                    name="service-list"
                    className="search-bar-picker-select"
                    options={options}
                    onChange={this.handleChange}
                    value={serviceName}
                    clearable={false}
                    placeholder=""
                />
          </div>
        );
    }
}
