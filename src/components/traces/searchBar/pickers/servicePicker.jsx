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
import serviceStore from '../../../../stores/serviceStore';

@observer
export default class ServicePicker extends React.Component {
  static propTypes = {
    uiState: PropTypes.object.isRequired
  };

  static convertToValueLabelMap(serviceList) {
    return serviceList.map(service => ({value: service, label: service}));
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);

    serviceStore.fetchServices();
  }

  handleChange(event) {
    console.log(event);
    this.props.uiState.setServiceName(event.value);
  }

  render() {
    console.log('ServicePicker rendered!');
    const serviceName = this.props.uiState.serviceName;

    return (
        <div>
          <header>Service</header>
          <Select
              name="service-list"
              options={ServicePicker.convertToValueLabelMap(serviceStore.services)}
              onChange={this.handleChange}
              value={serviceName}
              clearable={false}
          />
        </div>);
  }
}
