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
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

@observer
export default class TimeWindowPicker extends React.Component {
  static propTypes = {
    uiState: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.updateFieldKv = this.updateFieldKv.bind(this);
  }

  updateFieldKv(event) {
    this.props.uiState.setFieldsUsingKvString(event.target.value);
  }

  render() {
    return (
      <div className="search-bar-pickers_fields">
        <input
            type="text"
            className="search-bar-text-box"
            value={this.props.uiState.fieldsKvString}
            onChange={this.updateFieldKv}
        />
      </div>);
  }
}
