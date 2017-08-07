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
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import './serviceTools.less';

const ServiceTools = ({computedMatch, children}) => {
    const params = computedMatch.params;
    const navLinkClass = 'serviceToolsTab__tab-option col-xs-3';
    const navLinkClassActive = 'serviceToolsTab__tab-option col-xs-3 tab-active';
    return (<article className="serviceTools">
            <nav className="serviceToolsTab">
                <div className="container">
                    <div className="row">
                        <h3 className="serviceToolsTab__title col-md-5">{params.serviceName}</h3>
                        <nav className="serviceToolsTab__tabs col-md-7">
                            <NavLink
                                className={navLinkClass}
                                activeClassName={navLinkClassActive}
                                to={`/service/${params.serviceName}/flow`}
                            >
                                <span className="serviceToolsTab__tab-option-icon ti-vector"/>
                                Flow
                            </NavLink>
                            <NavLink
                                className={navLinkClass}
                                activeClassName={navLinkClassActive}
                                to={`/service/${params.serviceName}/trends`}
                            >
                                <span className="serviceToolsTab__tab-option-icon ti-stats-up"/>
                                Trends
                            </NavLink>
                            <NavLink
                                className={navLinkClass}
                                activeClassName={navLinkClassActive}
                                to={`/service/${params.serviceName}/traces`}
                            >
                                <span className="serviceToolsTab__tab-option-icon ti-line-double"/>
                                Traces
                            </NavLink>
                            <NavLink
                                className={navLinkClass}
                                activeClassName={navLinkClassActive}
                                to={`/service/${params.serviceName}/alerts`}
                            >
                                <span className="serviceToolsTab__tab-option-icon ti-bell"/>
                                Alerts
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </nav>
            <article className="serviceToolsContainer container">
                {children}
            </article>
        </article>
    );
};

ServiceTools.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    computedMatch: PropTypes.shape({
        params: PropTypes.shape({
            serviceName: PropTypes.string
        })
    }).isRequired
};

export default ServiceTools;
