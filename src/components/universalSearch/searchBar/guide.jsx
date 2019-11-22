/*
 * Copyright 2018 Expedia Group
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

const Guide = ({searchHistory}) => {
    const historyList = searchHistory.map((searchObject) => (
        <li key={searchObject}><code><a href={`/search?${searchObject}`}>{searchObject.split('&').join(', ')}</a></code></li>
    ));

    return (
        <div className="usb-suggestions__guide-wrapper pull-left">
            <section>
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
            </section>
            <section>
                <div><b>How tabs show up</b></div>
                <div>
                    <ul>
                        <li>If no tag searched -
                            <span className="usb-suggestions__guide-highlight">
                                <span className="ti-vector usb-suggestions__guide-tab"/><span> Service Graph </span>
                                <span className="ti-pie-chart usb-suggestions__guide-tab"/><span> Service Performance </span>
                            </span>
                        </li>
                        <li>If only serviceName (and/or operationName) searched -
                            <span className="usb-suggestions__guide-highlight">
                                <span className="ti-align-left usb-suggestions__guide-tab"/><span> Traces </span>
                                <span className="ti-stats-up usb-suggestions__guide-tab"/><span> Trends </span>
                                <span className="ti-bell usb-suggestions__guide-tab"/><span> Alerts </span>
                            </span>
                        </li>
                        <li>Any other combination of tags searched -
                            <span className="usb-suggestions__guide-highlight">
                                <span className="ti-align-left usb-suggestions__guide-tab"/><span> Traces </span>
                            </span>
                        </li>
                    </ul>
                </div>
            </section>
            <section>
                <div><b>History</b></div>
                <ul className="usb-suggestions__guide-history-list">
                    {historyList}
                </ul>
            </section>
        </div>
    );
};

Guide.propTypes = {
    searchHistory: PropTypes.object.isRequired
};

export default Guide;

