/*
 * Copyright 2018 Expedia, Inc.
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
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import timeWindow from '../../utils/timeWindow';
import {toQuery, toQueryUrlString} from '../../utils/queryParser';
import './alerts';

@observer
export default class AlertsToolbar extends React.Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired,
        alertsStore: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        const query = toQuery(this.props.location.search);
        const activeWindow = query.preset ? timeWindow.presets.findIndex(presetItem => presetItem.shortName === query.preset) : 3;
        this.state = {
            options: timeWindow.presets,
            activeWindow
        };

        this.getUnhealthyAlerts = this.getUnhealthyAlerts.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    getUnhealthyAlerts() {
        let unhealthyAlerts = 0;
        this.props.alertsStore.alerts.forEach((alert) => {
            if (alert.isUnhealthy) {
                unhealthyAlerts += 1;
            }
        });
        return unhealthyAlerts;
    }

    handleTimeChange(event) {
        const selectedIndex = event.target.value;
        const selectedWindow = this.state.options[selectedIndex];

        this.props.alertsStore.fetchServiceAlerts(this.props.serviceName, 300000, selectedWindow);
        const query = {
            preset: this.state.options[selectedIndex].shortName
        };
        const queryUrl = `?${toQueryUrlString(query)}`;
        this.props.history.push(queryUrl);
    }

    render() {
        return (
            <header>
                <div className="pull-left">
                    <div className="alerts-title__header">{this.getUnhealthyAlerts()} Unhealthy</div>
                    <div>out of {this.props.alertsStore.alerts.length} alerts for {this.props.serviceName}</div>
                </div>
                <div className="pull-right">
                    <span>Show trend for </span>
                    <select className="time-range-selector" onChange={this.handleTimeChange} defaultValue={this.state.activeWindow}>
                        {this.state.options.map((window, index) => (<option key={window.longName} value={index}>last {window.longName}</option>))}
                    </select>
                </div>
            </header>
        );
    }
}
