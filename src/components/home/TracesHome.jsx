/*
 * Copyright 2018 Expedia, Inc.
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
import Traces from '../traces/traces';

const TracesHome = ({history, location, match}) => (
    <article className="primary-content">
        <article className="serviceTools">
            <nav className="serviceToolsTab">
                <div className="container">
                    <h3 className="serviceToolsTab__title">
                        Traces
                    </h3>
                </div>
            </nav>
            <article className="serviceToolsContainer container">
                <Traces history={history} location={location} match={match}/>
            </article>
        </article>
    </article>
);

TracesHome.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
};

export default TracesHome;
