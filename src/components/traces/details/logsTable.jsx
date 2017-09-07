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
import moment from 'moment';
import _ from 'lodash';

const LogEnum = {
    ss: 'Server Send',
    sr: 'Server Receive',
    cs: 'Client Send',
    cr: 'Client Receive'
};

function findAnnotation(annotations, annotationValue) {
    return _.find(annotations, annotation => annotation.value.toLowerCase() === annotationValue);
}

const LogsTable = ({annotations}) => {
    const clientSend = findAnnotation(annotations, 'cs');
    const serverReceive = findAnnotation(annotations, 'sr');
    const serverSend = findAnnotation(annotations, 'ss');
    const clientReceive = findAnnotation(annotations, 'cr');

    const startSpan = (clientSend || serverReceive || serverSend || clientReceive);

    if (startSpan) {
        const startTime = startSpan.timestamp;

        return (<table className="table table-striped">
            <thead>
            <tr>
                <th>Value</th>
                <th>Relative</th>
                <th>Timestamp</th>
            </tr>
            </thead>
            <tbody>

            {_.compact([clientSend, serverReceive, serverSend, clientReceive]).map(annotation =>
                (<tr key={annotation.value}>
                    <td>{LogEnum[annotation.value]}</td>
                    <td>{(annotation.timestamp - startTime) / 1000}ms</td>
                    <td>{moment(annotation.timestamp / 1000).format('kk:mm:ss.SSS, DD MMM YY')}</td>
                </tr>)
            )}
            </tbody>
        </table>);
    }
    return <h6>No logs associated with span</h6>;
};

LogsTable.propTypes = {
    annotations: PropTypes.object.isRequired
};

export default LogsTable;
