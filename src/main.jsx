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

import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Home from './components/home/home';
import TracesHome from './components/home/TracesHome';
import Help from './components/docs/help';
import ServiceTools from './components/layout/serviceTools';
import Traces from './components/traces/traces';
import NoMatch from './components/common/noMatch';

export default () => (
    <Route>
        <div className="layout">
            <Header/>
            <article className="primary-content">
            { window.subsystems && window.subsystems.length === 1 && window.subsystems[0] === 'traces' ?
                <Switch>
                    <Route exact path="/" component={TracesHome}/>
                    <Route exact path="/search" component={Traces}/>
                    <Route exact path="/help" component={Help}/>
                    <Route path="*" component={NoMatch}/>
                </Switch> :
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/search" component={Traces}/>
                    <Route exact path="/help" component={Help}/>
                    <Route path="/service/:serviceName" component={ServiceTools}/>
                    <Route path="*" component={NoMatch}/>
                </Switch>
            }
            </article>
            <Footer/>
        </div>
    </Route>
);
