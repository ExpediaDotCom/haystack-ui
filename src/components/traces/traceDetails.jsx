/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

import React from 'react';

import './traceDetails.less';
import WorkInProgress from '../common/workInProgress';

export default () => (
    <section className="trace-details">
        <div className="trace-details-nav">
            <h4>Timeline</h4>
            <div className="trace-details-toolbar btn-group">
                <a className="btn btn-default"><span className="trace-details-toolbar-option-icon ti-share"/> Raw Trace</a>
                <a className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Copy Link</a>
            </div>
        </div>
        <WorkInProgress/>
    </section>
);
