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

import Autocomplete from '../../utils/autocomplete';

const fieldKeys = (window.haystackUiConfig && window.haystackUiConfig.fieldKeys) || null;

@observer
export default class TimeWindowPicker extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired
    };

    render() {
        // Import custom autosuggestion key list and pass in to autocomplete component with options={}
        return (
            <div className="search-bar-pickers_fields">
                <Autocomplete uiState={this.props.uiState} options={fieldKeys} />
            </div>
        );
    }
}
