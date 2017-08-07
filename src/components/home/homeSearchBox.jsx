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
import {Link} from 'react-router-dom';
import serviceStore from '../../stores/serviceStore';

@observer
export default class HomeSearchBox extends Component {
    constructor(props) {
        super(props);
        this.state = {service: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        serviceStore.fetchServices();
    }

    handleChange(event) {
        this.setState({service: event.target.value});
    }

    handleSelect(event) {
        if (!this.state.service || (this.state.service === 'Choose here')) {
            event.preventDefault();
        }
    }

    render() {
        return (
            <section className="container">
                <div className="jumbotron">
                    <h2 className="home__header">Select a service to start </h2>
                    <form className="form-horizontal">
                        <fieldset>
                            <div className="form-group">
                                <div className="col-lg-10 col-md-offset-3">
                                    <div className="col-md-6">
                                        <select
                                            value={this.state.service}
                                            onChange={this.handleChange}
                                            className="form-control selectpicker"
                                            id="select"
                                        >
                                            <option selected>Choose here</option>
                                            {serviceStore.services.map(ServiceListItem =>
                                                (<option
                                                    value={ServiceListItem}
                                                    key={ServiceListItem}
                                                >
                                                    {ServiceListItem}
                                                </option>))}
                                        </select>
                                    </div>
                                    <Link
                                        to={`/service/${this.state.service}/traces`}
                                        className="btn btn-primary trace-search"
                                        onClick={this.handleSelect}
                                        disabled={!this.state.service || this.state.service === 'Choose here'}
                                    >
                                        Select
                                    </Link>
                                </div>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </section>
        );
    }
}
