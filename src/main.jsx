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
import {Route, Switch} from 'react-router-dom';

import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Home from './components/home/home';
import TracesHome from './components/home/TracesHome';
import ServiceTools from './components/layout/serviceTools';
import HeaderSearchInterstitial from './components/layout/headerSearchInterstitial';
import traceDetailsStore from './components/traces/stores/traceDetailsStore';
import Login from './components/common/login';
import NoMatch from './components/common/noMatch';

const Layout = () => (
    <div className="layout">
        <Header/>
        <article className="primary-content">
            { window.haystackUiConfig.subsystems && window.haystackUiConfig.subsystems.length === 1 && window.haystackUiConfig.subsystems[0] === 'traces' ?
                <Switch>
                    <Route exact path="/" component={TracesHome}/>
                    <Route path="/traces/:traceId" render={props => <HeaderSearchInterstitial traceDetailsStore={traceDetailsStore} {...props} />} />
                    <Route path="*" component={NoMatch}/>
                </Switch> :
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/traces/:traceId" render={props => <HeaderSearchInterstitial traceDetailsStore={traceDetailsStore} {...props} />} />
                    <Route path="/service/:serviceName" component={ServiceTools}/>
                    <Route path="*" component={NoMatch}/>
                </Switch>
            }
        </article>
        <Footer/>
    </div>
);

export default () => (
    <Route>
        <Switch>
            <Route exact path="/login" render={props => <Login {...props} />}/>
            <Route path="*" component={Layout}/>
        </Switch>
    </Route>
);
