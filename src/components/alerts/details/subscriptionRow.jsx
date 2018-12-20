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

import SubscriptionModal from './subscriptionModal';

@observer
export default class SubscriptionRow extends React.Component {
    static propTypes = {
        subscription: PropTypes.object.isRequired,
        alertDetailsStore: PropTypes.object.isRequired,
        errorCallback: PropTypes.func.isRequired
    };


    static getDispatcherType(dispatcher) {
        if (dispatcher.type.toLowerCase() === 'slack') {
            return <div><img src="/images/slack.png" alt="Slack" className="alerts-slack-icon"/> Slack</div>;
        }
        return <div><span className="ti-email"/>  Email</div>;
    }

    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleDeleteSubscription = this.handleDeleteSubscription.bind(this);
        this.handleSubmitModifiedSubscription = this.handleSubmitModifiedSubscription.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    handleSubmitModifiedSubscription(modifiedSubscription) {
        const oldSubscription = this.props.subscription;
        const subscriptions = {old: oldSubscription, modified: modifiedSubscription};
        this.props.alertDetailsStore.updateSubscription(
            subscriptions,
            this.props.errorCallback
        );
        this.setState({activeModifyInput: null});
    }

    handleDeleteSubscription(subscriptionId) {
        this.props.alertDetailsStore.deleteSubscription(
            subscriptionId
        );
    }

    render() {
        const subscription = JSON.parse(JSON.stringify(this.props.subscription)); // deep copy, so client side changes don't affect store
        const {serviceName, operationName, name, interval} = subscription.expressionTree;
        const SubscriptionButtons = () => (
            <div className="btn-group btn-group-sm">
                <button onClick={this.openModal} className="btn btn-default alert-modify">
                    <span className="ti-pencil"/>
                </button>
                <button onClick={() => this.handleDeleteSubscription(subscription.subscriptionId)} className="btn btn-default">
                    <span className="ti-trash"/>
                </button>
            </div>);

        return (
            <tr className="non-highlight-row subscription-row">
                <td>
                    {subscription.dispatchers.map(dispatcher => (
                        <div key={Math.random()} className="subscription-dispatcher-row">
                            {SubscriptionRow.getDispatcherType(dispatcher)}:  {dispatcher.endpoint}
                            <br />
                        </div>
                        )
                    )}
                </td>
                <SubscriptionModal
                    title="Edit Subscription"
                    isOpen={this.state.modalIsOpen}
                    closeModal={this.closeModal}
                    serviceName={serviceName}
                    operationName={operationName}
                    type={name}
                    interval={interval}
                    dispatchers={subscription.dispatchers}
                    submitCallback={this.handleSubmitModifiedSubscription}
                />
                <td>
                    <SubscriptionButtons />
                </td>
            </tr>

        );
    }
}
