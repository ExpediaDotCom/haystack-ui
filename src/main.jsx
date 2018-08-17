/*
 * Copyright 2018 Expedia Group
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

import Header from './components/layout/legacyHeader';
import Footer from './components/layout/footer';
import LegacyHome from './components/legacyHome/legacyHome';
import TracesHome from './components/legacyHome/legacyTracesHome';
import ServiceTools from './components/layout/legacyServiceTools';
import HeaderSearchInterstitial from './components/layout/legacyHeaderSearchInterstitial';
import traceDetailsStore from './components/traces/stores/traceDetailsStore';
import Login from './components/common/login';
import NoMatch from './components/common/noMatch';
import UniversalSearch from './components/universalSearch/universalSearch';

const Layout = () => (
    <div className="layout">
        <Header/>
        <article className="primary-content">
            { window.haystackUiConfig.subsystems && window.haystackUiConfig.subsystems.length === 1 && window.haystackUiConfig.subsystems[0] === 'traces' ?
                <Switch>
                    <Route path="/legacy" component={TracesHome}/>
                    <Route path="/legacy/traces/:traceId" render={props => <HeaderSearchInterstitial traceDetailsStore={traceDetailsStore} {...props} />} />
                </Switch> :
                <Switch>
                    <Route exact path="/legacy" component={LegacyHome}/>
                    <Route path="/legacy/traces/:traceId" render={props => <HeaderSearchInterstitial traceDetailsStore={traceDetailsStore} {...props} />} />
                    <Route path="/legacy/service/:serviceName" component={ServiceTools}/>
                    <Route path="/legacy/*" component={NoMatch}/>
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
            <Route path="/legacy" component={Layout}/>
            <Route path="/" component={UniversalSearch} />
        </Switch>
    </Route>
);
