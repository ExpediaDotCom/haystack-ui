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

import axios from 'axios';
import createBrowserHistory from 'history/createBrowserHistory';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';

import LoginComponent from './components/common/login';
import Main from './main';
import userStore from './stores/userStore';


@withRouter
@observer
class LoginGateway extends React.Component {
    static clearUserDetails() {
        userStore.clearUser();
    }

    constructor(props) {
        super(props);
        this.redirectUrl = '/';
        this.state = {
            user: null
        };
        this.isLoggedIn = false;
        this.getUserDetails = this.getUserDetails.bind(this);
    }

    componentWillMount() {
        const customHistory = createBrowserHistory();
        this.redirectUrl = customHistory.location.pathname;

        this.getUserDetails();
    }


    getUserDetails() {
        return axios.get('/user/details')
            .then((res) => {
                userStore.setUser(res.data);
                this.setState({user: res.data});
                this.isLoggedIn = true;
            })
            .catch(() => {
                userStore.clearUser();
                LoginGateway.clearUserDetails();
            });
    }

    privateRoute(disableSSO) {
        return (
            <Route render={() => (
                this.isLoggedIn || disableSSO ? (
                        <div>
                            <Main />
                        </div>
                    ) : (
                        <Redirect to={{ pathname: '/login' }}/>
                    )
            )}
            />
        );
    }

    render() {
        const disableSSO = !window.haystackUiConfig.enableSSO;

        return (
            <Switch>
                <Route
                    exact
                    path="/login"
                    render={() => (
                        disableSSO ? <Redirect to={{ pathname: '/' }}/> : <LoginComponent redirectUrl={this.redirectUrl} />
                    )}
                />
                {this.privateRoute(disableSSO)}
            </Switch>
        );
    }
}

LoginGateway.propTypes = {
    location: PropTypes.object.isRequired
};


export default LoginGateway;
