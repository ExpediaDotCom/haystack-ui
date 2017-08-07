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
import {Link} from 'react-router-dom';
import './header.less';

export default () => (
    <header>
        <nav className="navbar navbar-default">
            <div className="container">
                <div className="navbar-header">
                    <a href="/" className="navbar-brand">
                        <img src="/images/logo.png" alt="Logo" className="logo" />
                        <span>Haystack</span>
                    </a>
                    <button
                        className="navbar-toggle"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbar-main"
                    >
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                    </button>
                </div>

                <div className="navbar-collapse collapse" id="navbar-main">

                    <div className="navbar-form navbar-right">
                        <input
                            type="text"
                            className="form-control layout__search"
                            placeholder="Search"
                        />
                        <Link
                            to="/trace"
                            className="btn btn-primary search-button"
                        >
                            <span className="ti-search"/>
                        </Link>
                    </div>

                    <ul className="nav navbar-nav navbar-right">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/help">Help</Link></li>
                    </ul>

                </div>
            </div>
        </nav>
    </header>
);
