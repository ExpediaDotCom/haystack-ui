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

function findLogEvent(logs, eventValue) {
    return _.find(logs, log => log.value.toLowerCase() === eventValue);
}

const LogsTable = ({logs}) => {
    const flattenedLogs = logs.map(log => log.fields.map(field => ({
      timestamp: log.timestamp,
      key: field.key,
      value: field.value
    }))).reduce((x, y) => x.concat(y), []);

    if (flattenedLogs) {
        const clientSend = findLogEvent(flattenedLogs, 'cs');
        const serverReceive = findLogEvent(flattenedLogs, 'sr');
        const serverSend = findLogEvent(flattenedLogs, 'ss');
        const clientReceive = findLogEvent(flattenedLogs, 'cr');

        const startSpan = (clientSend || serverReceive || serverSend || clientReceive);
        let startTime = 0;
        if (startSpan) startTime = startSpan.timestamp;

        // display while making sure that logical ordering of events is maintained
        return (<table className="table table-striped">
            <thead>
            <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Relative</th>
                <th>Timestamp</th>
            </tr>
            </thead>
            <tbody>

            {_.compact(_.union([clientSend, serverReceive, serverSend, clientReceive, ...flattenedLogs])).map(log =>
                (<tr key={log.value}>
                    <td>{log.key}</td>
                    <td>{LogEnum[log.value]}</td>
                    <td>{(log.timestamp - startTime) / 1000}ms</td>
                    <td>{moment(log.timestamp / 1000).format('kk:mm:ss.SSS, DD MMM YY')}</td>
                </tr>)
            )}
            </tbody>
        </table>);
    }
    return <h6>No logs associated with span</h6>;
};

LogsTable.propTypes = {
    logs: PropTypes.object.isRequired
};

export default LogsTable;
