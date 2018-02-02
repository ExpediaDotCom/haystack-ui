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

import AlertsView from './alertsView';
import './alerts.less';
import alertsStore from './stores/serviceAlertsStore';
import timeWindow from '../../utils/timeWindow';
import {toQuery} from '../../utils/queryParser';

@observer
export default class Alerts extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {serviceName: this.props.match.params.serviceName};
    }

    componentDidMount() {
        const query = toQuery(this.props.location.search);
        const activeWindow = query.preset ? timeWindow.presets.findIndex(presetItem => presetItem.shortName === query.preset) : 1;
        alertsStore.fetchServiceAlerts(this.state.serviceName, timeWindow.presets[activeWindow]);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.params.serviceName !== this.state.serviceName) {
            this.setState({serviceName: nextProps.match.params.serviceName});
            alertsStore.fetchServiceAlerts(nextProps.match.params.serviceName, timeWindow.presets[1]);
        }
    }

    render() {
        return (
            <section className="alerts-panel">
                <AlertsView serviceName={this.state.serviceName} location={this.props.location} history={this.props.history} alertsStore={alertsStore}/>
            </section>

        );
    }
}
