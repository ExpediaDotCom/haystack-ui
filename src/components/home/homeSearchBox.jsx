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
import Select from 'react-select';
import PropTypes from 'prop-types';
import './homeSearchBox.less';

@observer
export default class HomeSearchBox extends Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        services: PropTypes.array.isRequired
    };

    static formatServiceOptions(serviceList) {
        const serviceListOptions = [];
        serviceList.map(serviceListItem =>
            serviceListOptions.push({value: serviceListItem, label: serviceListItem}
            ));

        return serviceListOptions;
    }

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.history.push(`/service/${event.value}/traces`);
    }

    render() {
        return (
            <section className="container">
                <div className="jumbotron">
                    <h2 className="home__header">Select a service to start </h2>
                    <div className="col-md-4 col-md-offset-4" >
                        <Select
                            className="test"
                            name="service-list"
                            options={HomeSearchBox.formatServiceOptions(this.props.services)}
                            onChange={this.handleChange}
                            placeholder="Choose here..."
                        />
                    </div>
                </div>
            </section>
        );
    }
}
