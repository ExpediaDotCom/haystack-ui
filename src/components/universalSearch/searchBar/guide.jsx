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

export default () => (
    <div className="usb-suggestions__helpers-wrapper pull-left">
        <p>
            <div><b>How to search</b></div>
            <div>Specify tag key value pairs (in whitespace separated key=value format) to search for traces containing give tags, eg:</div>
            <ul>
                <li>Traces having traceId xxxx :<code>traceId=xxxx</code></li>
                <li>Traces passing through test-svc service: <code>serviceName=test-svc</code></li>
                <li>Traces passing through test-svc service and having error in any of its spans: <code>serviceName=test-svc error=true</code></li>
            </ul>
            <div>To target a specific span, enclose tag list in parenthesis, eg:</div>
            <ul>
                <li>Traces having testid=1 and having error in service test-svc span: <code>testid=1 (serviceName=test-svc error=true)</code></li>
            </ul>
        </p>
        <p>
            <div><b>How tabs show up</b></div>
            <div>
                <ul>
                    <li>If no tag searched - <span className="ti-vector"/><span> Service Graph</span></li>
                    <li>If only serviceName (and/or operationName) searched - <span className="ti-align-left"/><span> Traces</span>, <span className="ti-stats-up"/><span> Trends</span>, <span className="ti-bell"/><span> Alerts</span></li>
                    <li>Any other combination of tags searched - <span className="ti-align-left"/><span> Traces</span></li>
                </ul>
            </div>
        </p>
        <p>
            <b>History</b>
            <ul>
                <li><code>coming soon</code></li>
            </ul>
        </p>
    </div>
);
