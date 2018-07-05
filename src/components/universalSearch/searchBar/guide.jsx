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
            <b>Guide</b>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
            <div>Examples</div>
            <ul>
                <li><code>serviceName=test-service</code></li>
                <li><code>testid=1 (serviceName=test-service error=true)</code></li>
            </ul>
        </p>
        <p>
            <b>History</b>
            <ul>
                <li><code>serviceName=test-service</code></li>
                <li><code>testid=1 (serviceName=test-service error=true)</code></li>
            </ul>
        </p>
    </div>
);
