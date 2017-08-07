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
import {Route, Switch} from 'react-router-dom';
import PageLayout from './components/layout/pageLayout';
import Home from './components/home/home';
import NoMatch from './components/common/noMatch';
import Help from './components/docs/help';
import ServiceTools from './components/layout/serviceTools';
import Flow from './components/flow/flow';
import Traces from './components/traces/traces';
import Trends from './components/trends/trends';
import Alerts from './components/alerts/alerts';


export default () => (
    <Route>
        <PageLayout>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/search" component={Traces}/>
                <Route path="/help" component={Help}/>
                <Route path="/service/:serviceName">
                    <Switch>
                        <ServiceTools>
                            <Route exact path="/service/:serviceName/traces" component={Traces}/>
                            <Route path="/service/:serviceName/trends" component={Trends}/>
                            <Route path="/service/:serviceName/flow" component={Flow}/>
                            <Route path="/service/:serviceName/alerts" component={Alerts}/>
                        </ServiceTools>
                    </Switch>
                </Route>
                <Route path="*" component={NoMatch}/>
            </Switch>
        </PageLayout>
    </Route>
);
