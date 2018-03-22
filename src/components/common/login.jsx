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

import PropTypes from 'prop-types';
import React from 'react';
import './login.less';

const Login = ({ redirectUrl }) => (
    <div className="row login-cover text-center">
        <div className="jumbotron login-box text-center">
            <h1 className="login-box_title">
                <img src="/images/logo.png" alt="Logo" className="login-box_logo"/>
                <span>Haystack</span>
            </h1>
            <a href={`/auth/login?redirectUrl=${redirectUrl !== '/login' ? redirectUrl : '/'}`} className="login-box_btn btn btn-primary btn-lg">Sign in</a>
        </div>
    </div>
);

Login.propTypes = {
    redirectUrl: PropTypes.string.isRequired
};

export default Login;

