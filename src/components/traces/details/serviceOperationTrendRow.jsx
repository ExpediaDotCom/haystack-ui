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

import colorMapper from '../../../utils/serviceColorMapper';

@observer
export default class LatencyCost extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired
    };

    componentWillMount() {
        console.log('trigger ajax');
    }

    render() {
        const {serviceName, operationName} = this.props;

        return (
            <tr>
                <td className="trace-trend-table_cell">
                    <div className={`service-spans label label-default ${colorMapper.toBackgroundClass(serviceName)}`}>
                        {serviceName}
                    </div>
                    <div className="trace-trend-table_op-name">{operationName}</div>
                </td>
                <td className="trace-trend-table_cell">
                    a
                </td>
                <td className="trace-trend-table_cell">
                    b
                </td>
                <td className="trace-trend-table_cell">
                    c
                </td>
            </tr>
        );
    }
}
