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

const Login = ({ redirectUrl }) => (
    <div className="row login-cover text-center">
        <div className="container">
            <div className="jumbotron col-md-8 col-md-offset-2 login-box text-center">
                <h1>Haystack</h1>
                <a href={`/auth/login?redirectUrl=${redirectUrl !== '/login' ? redirectUrl : '/home'}`} className="btn btn-primary">Sign in</a>
            </div>
        </div>
    </div>
);

Login.propTypes = {
    redirectUrl: PropTypes.string.isRequired
};

export default Login;

