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
import {autorun} from 'mobx';
import Select from 'react-select';
import operationStore from '../../../../stores/operationStore';

@observer
export default class OperationPicker extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired
    };

    static convertToValueLabelMap(operationList) {
      return operationList.map(operation => ({value: operation, label: operation}));
    }

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

        autorun(() => {
          if (props.uiState.serviceName) {
            operationStore.fetchOperations(this.props.uiState.serviceName);
          }
          if (!props.uiState.operationName) {
              props.uiState.setOperationName('all');
          }
        });
    }

    handleChange(event) {
      this.props.uiState.setOperationName(event.value);
    }

    render() {
      const operationName = this.props.uiState.operationName || operationStore.operations[0];

      // default to current operation if there is no operation in store
      const options = operationStore.operations.length
          ? OperationPicker.convertToValueLabelMap(operationStore.operations)
          : OperationPicker.convertToValueLabelMap([operationName]);

        return (
            <div className="search-bar-pickers_operation">
              <Select
                name="operation-list"
                className="search-bar-picker-select"
                options={options}
                onChange={this.handleChange}
                value={operationName}
                clearable={false}
                placeholder=""
              />
            </div>);
    }
}
