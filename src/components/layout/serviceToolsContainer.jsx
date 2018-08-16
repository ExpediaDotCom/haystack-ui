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

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import './serviceTools.less';

import Traces from '../traces/traces';
import Trends from '../trends/trends';
import Alerts from '../alerts/alerts';

const subsystems = (window.haystackUiConfig && window.haystackUiConfig.subsystems) || [];

const isTrendsEnabled = subsystems.includes('trends');
const isAlertsEnabled = subsystems.includes('alerts');

export default class ServiceToolsContainer extends Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return (this.props.serviceName !== nextProps.serviceName)
            || (this.props.location.pathname !== nextProps.location.pathname)
            || (this.props.location.search !== nextProps.location.search);
    }

    render() {
        return (
            <article className="serviceToolsContainer container">
                <Switch>
                    <Route exact path="/legacy/service/:serviceName" component={Trends}/>
                    <Route exact path="/legacy/service/:serviceName/traces" component={Traces}/>
                    {isTrendsEnabled && <Route exact path="/legacy/service/:serviceName/trends" component={Trends}/>}
                    {isAlertsEnabled && <Route exact path="/legacy/service/:serviceName/alerts" component={Alerts}/>}
                </Switch>
            </article>
        );
    }
}
