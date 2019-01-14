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

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import SubscriptionRow from './subscriptionRow';
import SubscriptionModal from './subscriptionModal';

@observer
export default class AlertSubscriptions extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        interval: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false,
            subscriptionError: false
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.submitNewSubscription = this.submitNewSubscription.bind(this);
        this.handleSuccessfulNewSubscription = this.handleSuccessfulNewSubscription.bind(this);
        this.handleSubscriptionError = this.handleSubscriptionError.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    handleSuccessfulNewSubscription() {
        this.props.alertDetailsStore.fetchAlertSubscriptions(this.props.serviceName, this.props.operationName, this.props.type, this.props.interval);
        this.setState({
            showNewSubscriptionBox: false,
            subscriptionError: false
        });
    }

    handleSubscriptionError() {
        this.setState({
            subscriptionError: true
        });
        setTimeout(() => this.setState({subscriptionError: false}), 4000);
    }

    submitNewSubscription(subscription) {
        this.props.alertDetailsStore.addNewSubscription(
            subscription,
            this.handleSuccessfulNewSubscription,
            this.handleSubscriptionError
        );
    }

    render() {
        const {
            subscriptionError
        } = this.state;

        const alertSubscriptions = this.props.alertDetailsStore.alertSubscriptions;

        return (
            <section className="subscriptions col-md-6">
                <h4>Subscriptions</h4>
                <table className="subscriptions__table table">
                    <thead>
                        <tr>
                            <th width="70%">Dispatchers</th>
                            <th width="30%">Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            alertSubscriptions && alertSubscriptions.length
                                ? alertSubscriptions.map(subscription =>
                                    (<SubscriptionRow
                                        key={subscription.subscriptionId}
                                        subscription={subscription}
                                        alertDetailsStore={this.props.alertDetailsStore}
                                        errorCallback={this.handleSubscriptionError}
                                    />))
                                : <tr className="non-highlight-row"><td /><td>No Subscriptions Found</td></tr>
                        }
                        <SubscriptionModal
                            serviceName={this.props.serviceName}
                            operationName={this.props.operationName}
                            type={this.props.type}
                            title="Add Subscription"
                            isOpen={this.state.modalIsOpen}
                            closeModal={this.closeModal}
                            submitCallback={this.submitNewSubscription}
                            interval={this.props.interval}
                        />
                    </tbody>
                </table>
                <div className="text-left subscription-button">
                    <button className="btn btn-sm btn-success" onClick={this.openModal}>
                        <span className="ti-plus"/> Add Subscription
                    </button>
                </div>
                <div className={subscriptionError ? 'subscription-error' : 'hidden'}>
                    {/* TODO: more verbose errors */}
                    Could not process subscription. Please try again.
                </div>
            </section>
        );
    }
}
