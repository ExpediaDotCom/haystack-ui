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

import React, {Component} from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import HomeSearchBox from './homeSearchBox';
import serviceStore from '../../stores/serviceStore';
import './home.less';
import WorkInProgress from '../common/workInProgress';

@observer
export default class Home extends Component {
    componentWillMount() {
        serviceStore.fetchServices();
    }

    render() {
        return (
            <article>
                <HomeSearchBox history={this.props.history} services={serviceStore.services}/>
                <article className="container home-panel">
                    <section className="row">
                        <WorkInProgress/>
                    </section>
                </article>
            </article>
        );
    }
}

Home.propTypes = {
    history: PropTypes.object.isRequired
};

