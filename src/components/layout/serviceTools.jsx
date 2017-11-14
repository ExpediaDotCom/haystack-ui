/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import Select from 'react-select';
import './serviceTools.less';
import serviceStore from '../../stores/serviceStore';
import ServiceToolsContainer from './serviceToolsContainer';

const subsystems = (window.haystackUiConfig && window.haystackUiConfig.subsystems) || [];

const isFlowEnabled = subsystems.includes('flow');
const isTrendsEnabled = subsystems.includes('trends');
const isAlertsEnabled = subsystems.includes('alerts');

export default class ServiceTools extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired
    };

    static convertToValueLabelMap(serviceList) {
        return serviceList.map(service => ({value: service, label: service}));
    }

    constructor(props) {
        super(props);

        this.state = {
            serviceChangeToggleOpen: false
        };

        this.handleServiceChange = this.handleServiceChange.bind(this);
        this.showServiceChanger = this.showServiceChanger.bind(this);
        this.hideServiceChanger = this.hideServiceChanger.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.setToggleRef = this.setToggleRef.bind(this);

        serviceStore.fetchServices();
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    setToggleRef(node) {
        this.toggleRef = node;
    }

    handleServiceChange(event) {
        const pathname = this.props.location.pathname;
        const activeView = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
        this.props.history.push(`/service/${event.value}/${activeView}`);
        this.setState({serviceChangeToggleOpen: false});
    }

    hideServiceChanger() {
        document.removeEventListener('mousedown', this.handleOutsideClick);
        this.setState({serviceChangeToggleOpen: false});
    }

    showServiceChanger() {
        document.addEventListener('mousedown', this.handleOutsideClick);
        this.setState({serviceChangeToggleOpen: true});
    }

    handleOutsideClick(e) {
        if ((this.wrapperRef && !this.wrapperRef.contains(e.target))
            && (this.toggleRef && !this.toggleRef.contains(e.target))) {
            this.hideServiceChanger();
        }
    }

    render() {
        const serviceName = this.props.match.params.serviceName;
        const serviceTitleStyle = serviceName.length > 35 ? {fontSize: 24, lineHeight: 1.5} : {fontSize: 34};
        const navLinkClass = 'serviceToolsTab__tab-option col-xs-3';
        const navLinkClassActive = 'serviceToolsTab__tab-option col-xs-3 tab-active';
        const serviceChangeToggleOpen = this.state.serviceChangeToggleOpen;

        const Tabs = () => (<nav className="serviceToolsTab__tabs col-md-7">
            {isFlowEnabled ?
                <NavLink
                    className={navLinkClass}
                    activeClassName={navLinkClassActive}
                    exact
                    to={`/service/${serviceName}/flow`}
                >
                    <span className="serviceToolsTab__tab-option-icon ti-vector"/>
                    Flow
                </NavLink>
                : null
            }
            <NavLink
                className={navLinkClass}
                activeClassName={navLinkClassActive}
                to={`/service/${serviceName}/traces`}
            >
                <span className="serviceToolsTab__tab-option-icon ti-line-double"/>
                Traces
            </NavLink>
            {isTrendsEnabled ?
                <NavLink
                    className={navLinkClass}
                    activeClassName={navLinkClassActive}
                    to={`/service/${serviceName}/trends`}
                >
                    <span className="serviceToolsTab__tab-option-icon ti-stats-up"/>
                    Trends
                </NavLink>
                : null
            }
            {isAlertsEnabled ?
                <NavLink
                    className={navLinkClass}
                    activeClassName={navLinkClassActive}
                    to={`/service/${serviceName}/alerts`}
                >
                    <span className="serviceToolsTab__tab-option-icon ti-bell"/>
                    Alerts
                </NavLink>
                : null
            }
        </nav>);

        const ServiceChange = () => ((
            <article ref={this.setWrapperRef} className="serviceChangeContainer">
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12">
                            <span className="serviceChangeContainer__title">Change Service:</span>
                            <Select
                                className="serviceChangeContainer__select"
                                options={ServiceTools.convertToValueLabelMap(serviceStore.services)}
                                onChange={this.handleServiceChange}
                                placeholder="Select..."
                            />
                        </div>
                    </div>
                </div>
            </article>
        ));

        return (<article className="serviceTools">
                <nav className="serviceToolsTab">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-5">
                                <h3 ref={this.setToggleRef} style={serviceTitleStyle} className="serviceToolsTab__title" onClick={serviceChangeToggleOpen ? this.hideServiceChanger : this.showServiceChanger}>
                                    <span className="serviceToolsTab__title-name">{serviceName}</span>
                                    <span className={serviceChangeToggleOpen ? 'serviceToolsTab__title-toggle ti-arrow-circle-up' : 'serviceToolsTab__title-toggle ti-arrow-circle-down'} />
                                </h3>
                            </div>
                            <Tabs/>
                        </div>
                    </div>
                </nav>

                { serviceChangeToggleOpen ? <ServiceChange/> : null }

                <ServiceToolsContainer serviceName={serviceName} location={this.props.location}/>
            </article>
        );
    }
}
