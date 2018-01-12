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

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import AlertDetailsContainer from './alertDetailsContainer';
import alertDetailsStore from '../stores/alertDetailsStore';
import Loading from '../../common/loading';
import Error from '../../common/error';

@observer
export default class AlertDetails extends React.Component {
    static propTypes = {
        row: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    componentDidMount() {
        alertDetailsStore.fetchAlertHistory(this.props.row.alertId);
    }

    render() {
        return (
            <section className="table-row-details">
            {
                alertDetailsStore.promiseState && alertDetailsStore.promiseState.case({
                    pending: () => <Loading />,
                    rejected: () => <Error />,
                    fulfilled: () => <AlertDetailsContainer alertDetailsStore={alertDetailsStore} serviceName={this.props.serviceName} row={this.props.row} />
                })
            }
        </section>
        );
    }
}