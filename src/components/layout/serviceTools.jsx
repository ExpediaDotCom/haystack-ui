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
import {Route, Switch, NavLink} from 'react-router-dom';
import './serviceTools.less';

import Flow from '../flow/flow';
import Traces from '../traces/traces';
import Trends from '../trends/trends';
import Alerts from '../alerts/alerts';

const subsystems = window.subsystems || [];

const isFlowEnabled = subsystems.includes('flow');
const isTrendsEnabled = subsystems.includes('trends');
const isTracesEnabled = subsystems.includes('traces');
const isAlertsEnabled = subsystems.includes('alerts');
const ServiceTools = (props) => {
    const serviceName = props.match.params.serviceName;
    const serviceTitleStyle = serviceName.length > 35 ? {fontSize: 25, lineHeight: 1.5} : {fontSize: 34};
    const navLinkClass = 'serviceToolsTab__tab-option col-xs-3';
    const navLinkClassActive = 'serviceToolsTab__tab-option col-xs-3 tab-active';

    return (<article className="serviceTools">
            <nav className="serviceToolsTab">
                <div className="container">
                    <div className="row">
                        <h3 style={serviceTitleStyle} className="serviceToolsTab__title col-md-5">{serviceName}</h3>
                        <nav className="serviceToolsTab__tabs col-md-7">
                          {isFlowEnabled ?
                              <NavLink
                                  className={navLinkClass}
                                  activeClassName={navLinkClassActive}
                                  exact
                                  to={`/service/${serviceName}/flow`}
                              >
                                  <span className="serviceToolsTab__tab-option-icon ti-vector"/>
                                  Flow
                              </NavLink>
                              : null
                          }
                          {isTrendsEnabled ?
                              <NavLink
                                  className={navLinkClass}
                                  activeClassName={navLinkClassActive}
                                  to={`/service/${serviceName}/trends`}
                              >
                                  <span className="serviceToolsTab__tab-option-icon ti-stats-up"/>
                                  Trends
                              </NavLink>
                              : null
                          }
                          {isTracesEnabled ?
                              <NavLink
                                  className={navLinkClass}
                                  activeClassName={navLinkClassActive}
                                  to={`/service/${serviceName}/traces`}
                              >
                                  <span className="serviceToolsTab__tab-option-icon ti-line-double"/>
                                  Traces
                              </NavLink>
                              : null
                          }
                          {isAlertsEnabled ?
                              <NavLink
                                  className={navLinkClass}
                                  activeClassName={navLinkClassActive}
                                  to={`/service/${serviceName}/alerts`}
                              >
                                  <span className="serviceToolsTab__tab-option-icon ti-bell"/>
                                  Alerts
                              </NavLink>
                              : null
                          }
                        </nav>
                    </div>
                </div>
            </nav>
            <article className="serviceToolsContainer container">
                <Switch>
                  <Route exact path="/service/:serviceName" component={Trends}/>
                  {isAlertsEnabled ? <Route exact path="/service/:serviceName/flow" component={Flow}/> : null}
                  {isTrendsEnabled ? <Route exact path="/service/:serviceName/traces" component={Traces}/> : null}
                  {isTracesEnabled ? <Route exact path="/service/:serviceName/trends" component={Trends}/> : null}
                  {isAlertsEnabled ? <Route exact path="/service/:serviceName/alerts" component={Alerts}/> : null}
                </Switch>
            </article>
        </article>
    );
};

ServiceTools.propTypes = {
    match: PropTypes.object.isRequired
};

export default ServiceTools;
