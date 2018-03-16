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
import Cookies from 'js-cookie';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';

import LoginComponent from './components/common/login';
import Main from './main';
import UiStore from './stores/userStore';


@withRouter
@observer
class LoginGateway extends React.Component {
    static clearUserDetails() {
        UiStore.clearUser();
    }

    constructor(props) {
        super(props);

        this.isLoggedIn = false;
        this.redirectUrl = '/';
        this.state = {
            user: null
        };
        this.getUserDetails = this.getUserDetails.bind(this);
    }

    componentWillMount() {
        const customHistory = createBrowserHistory();
        this.redirectUrl = customHistory.location.pathname;

        this.isLoggedIn = !!Cookies.get('userId');
        if (this.isLoggedIn) this.getUserDetails();
        else LoginGateway.clearUserDetails();
    }


    getUserDetails() {
        return axios.get('/user/details')
            .then((res) => {
                UiStore.setUser(res.data);
                // Update UI state to trigger re-render of Children Components
                this.setState({ user: res.data });
            })
            .catch(() => {
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
    location: PropTypes.string
};

LoginGateway.defaultProps = {
    location: '/'
};


export default LoginGateway;
