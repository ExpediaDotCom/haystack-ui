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
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import Perf from 'react-addons-perf';
import AppRoutes from './appRoutes';
import storesInitializer from './stores/storesInitializer';

// app initializers
Perf.start();
storesInitializer.init();

// mount react components
ReactDOM.render(
    <Router history={history}>
        <AppRoutes/>
    </Router>
    , document.getElementById('root')
);

// measuring perf for development purposes
// TODO remove once production ready
Perf.stop();
Perf.printWasted();
Perf.printInclusive();
Perf.printExclusive();
