/*
 * Copyright 2018 Expedia, Inc.
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
import PropTypes from 'prop-types';

import './traces.less';

const Traces = () => (
    <section className="traces-panel">
        <div className="clearfix" style={{backgroundColor: 'white', padding: '6px 12px', marginBottom: '18px'}}>
            <h5 className="pull-left" >
                <span className="" style={{}}>Search for traces going through <b>expweb</b></span>
            </h5>
            <h5 className="pull-right" >
                <a className="pull-right btn btn-primary" style={{width: '300px'}} href="/usb?serviceName=expweb">Use Traces Universal Search</a>
            </h5>
        </div>
        <div className="clearfix" style={{backgroundColor: 'white', padding: '6px 12px'}}>
            <h5 className="pull-left" >
                <span>Search for traces going through <b>expweb</b> operation <select className="h5" style={{backgroundColor: 'white', padding: '0 18px'}}><option>http.request.context</option></select>
                </span>
            </h5>
            <h5 className="pull-right" >
                <a className="pull-right btn btn-primary" style={{width: '300px'}} href="/usb?serviceName=expweb">Search Traces for Universal Search</a>
            </h5>
        </div>
    </section>
);

Traces.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
};

export default Traces;
