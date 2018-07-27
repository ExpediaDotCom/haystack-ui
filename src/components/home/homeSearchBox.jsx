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

import React, {Component} from 'react';
import {observer} from 'mobx-react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import Typist from 'react-typist';
import {Link} from 'react-router-dom';

import './homeSearchBox.less';

@observer
export default class HomeSearchBox extends Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired // array wrapped in a mobx observer object
    };

    static convertToValueLabelMap(serviceList) {
        return serviceList
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(service => ({value: service, label: service}));
    }

  constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.history.push(`/service/${encodeURIComponent(event.value)}/trends`);
    }

    render() {
        const ServiceSelectorPrimary = () => (
            <div>
                <div className="clearfix secondary-home-container">
                    <div className="pull-left">
                        <Typist
                            startDelay={500}
                            className="pull-right typist-position"
                            stdTypingDelay={10}
                            avgTypingDelay={10}
                            cursor={{hideWhenDone: true, element: '_', blink: true}}
                        >
                            <span>Try the new way of searching in Haystack!</span>
                        </Typist>
                    </div>
                    <div className="pull-right">
                        <Link className="pull-right btn btn-primary btn-md" to="/usb">GO TO UNIVERSAL SEARCH</Link>
                    </div>
                </div>
                <div className="primary-home-container">
                    <h2 className="home__header">Select a service to start </h2>
                    <div className="col-md-4 col-md-offset-4" >
                        <Select
                            name="service-list"
                            options={HomeSearchBox.convertToValueLabelMap(this.props.services)}
                            onChange={this.handleChange}
                            placeholder="Select..."
                        />
                    </div>
                </div>
            </div>
        );

        const UniversalSearchPrimary = () => (
            <div>
                <div className="primary-home-container primary-home-container__usb">
                    <h3 className="home__header">Try new way of searching in Haystack</h3>
                    <div className="col-md-4 col-md-offset-4" >
                        <Link className="btn btn-primary btn-lg primary-home-container__goto-button" to="/usb">GOTO UNIVERSAL SEARCH</Link>
                    </div>
                </div>
                <div className="clearfix secondary-home-container">
                    <div className="pull-left">
                        <span>Select a service to start</span>
                    </div>
                    <div className="pull-right">
                        <Select
                            name="service-list"
                            className="service-list__secondary"
                            options={HomeSearchBox.convertToValueLabelMap(this.props.services)}
                            onChange={this.handleChange}
                            placeholder="Select..."
                        />
                    </div>
                </div>
            </div>
        );

        return (
            <section className="container">
                <div className="jumbotron">
                    {
                        window.haystackUiConfig.usbPrimary ? <UniversalSearchPrimary/> : <ServiceSelectorPrimary/>
                    }
                </div>
            </section>
        );
    }
}
