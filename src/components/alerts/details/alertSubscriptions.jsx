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
import {observer} from 'mobx-react';

@observer
export default class AlertSubscriptions extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    };

    static getSubscriptionType(subscription) {
        if (subscription.dispatcherType === 'slack') {
            return <div><img src="/images/slack.png" alt="Slack" className="alerts-slack-icon"/> Slack</div>;
        }
        return <div><span className="ti-email"/>  Email</div>;
    }

    static handleInputKeypress(e, escapeCallback, enterCallback) {
        if (e.keyCode === 27) {
            escapeCallback();
        } else if (e.keyCode === 13) {
            enterCallback();
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            showNewSubscriptionBox: false,
            subscriptionError: false,
            activeModifyBox: null
        };

        this.modifyInputRefs = {};

        this.toggleNewSubscriptionBox = this.toggleNewSubscriptionBox.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSuccessfulNewSubscription = this.handleSuccessfulNewSubscription.bind(this);
        this.handleNewSubscriptionError = this.handleNewSubscriptionError.bind(this);
        this.setNewInputRef = this.setNewInputRef.bind(this);
        this.setSelectRef = this.setSelectRef.bind(this);
        this.handleModifySubscription = this.handleModifySubscription.bind(this);
        this.setModifyInputRefs = this.setModifyInputRefs.bind(this);
        this.handleSubmitModifiedSubscription = this.handleSubmitModifiedSubscription.bind(this);
        this.handleCancelModifiedSubscription = this.handleCancelModifiedSubscription.bind(this);
    }

    setModifyInputRefs(num, node) {
        this.modifyInputRefs[num] = node;
    }

    setNewInputRef(node) {
        this.newInputRef = node;
    }

    setSelectRef(node) {
        this.selectRef = node;
    }

    handleSuccessfulNewSubscription() {
        this.props.alertDetailsStore.fetchAlertSubscriptions(this.props.serviceName, this.props.operationName, this.props.type);
        this.setState({
            showNewSubscriptionBox: false,
            subscriptionError: false
        });
    }

    handleModifySubscription(alertId) {
        this.setState({activeModifyBox: alertId});
        this.modifyInputRefs[alertId].disabled = false;
        this.modifyInputRefs[alertId].focus();
    }

    handleNewSubscriptionError() {
        this.setState({
            subscriptionError: true
        });
    }

    handleSubmitModifiedSubscription() {
        this.props.alertDetailsStore.updateSubscription(
            this.props.serviceName,
            this.props.operationName,
            this.props.type,
            this.state.activeModifyBox,
            this.modifyInputRefs[this.state.activeModifyBox].value
        );
        this.modifyInputRefs[this.state.activeModifyBox].disabled = true;
        this.setState({activeModifyBox: null});
    }

    handleCancelModifiedSubscription() {
        this.modifyInputRefs[this.state.activeModifyBox].value = '';
        this.modifyInputRefs[this.state.activeModifyBox].disabled = true;
        this.setState({activeModifyBox: null});
    }

    toggleNewSubscriptionBox() {
        this.setState(prevState => ({
            showNewSubscriptionBox: !prevState.showNewSubscriptionBox,
            subscriptionError: false
        }));
        this.newInputRef.value = '';
    }

    handleSubmit() {
        const handle = this.newInputRef.value;
        const medium = this.selectRef.value;
        this.props.alertDetailsStore.addNewSubscription(
            this.props.serviceName,
            this.props.operationName,
            this.props.type,
            medium,
            handle,
            this.handleSuccessfulNewSubscription,
            this.handleNewSubscriptionError
        );
    }

    render() {
        const showNewSubscriptionBox = this.state.showNewSubscriptionBox;

        return (
            <section className="subscriptions col-md-6">
                <h4>Subscriptions</h4>
                <table className="subscriptions__table table">
                    <thead>
                    <tr>
                        <th width="20%">Medium</th>
                        <th width="50%">Medium Handle</th>
                        <th width="25%">Modify</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.alertDetailsStore.alertSubscriptions.length ? this.props.alertDetailsStore.alertSubscriptions.map(subscription => (
                        <tr className="non-highlight-row subscription-row" key={subscription.subscriptionId}>
                            <td>{AlertSubscriptions.getSubscriptionType(subscription)}</td>
                            <td>
                                <input
                                    ref={node => this.setModifyInputRefs(subscription.subscriptionId, node)}
                                    onKeyDown={event => AlertSubscriptions.handleInputKeypress(event, this.handleCancelModifiedSubscription, this.handleSubmitModifiedSubscription)}
                                    placeholder={subscription.dispatcherIds[0]}
                                    disabled
                                    className="alert-subscription-handle"
                                />
                            </td>
                            <td>
                                {this.state.activeModifyBox === subscription.subscriptionId ?
                                    <div className="btn-group btn-group-sm">
                                        <button onClick={this.handleSubmitModifiedSubscription} className="btn btn-success">
                                            <span className="ti-check"/>
                                        </button>
                                        <button onClick={this.handleCancelModifiedSubscription} className="btn btn-danger">
                                            <span className="ti-na"/>
                                        </button>
                                    </div> :
                                    <div className="btn-group btn-group-sm">
                                        <button onClick={() => this.handleModifySubscription(subscription.subscriptionId)} className="btn btn-default">
                                            <span className="ti-pencil"/>
                                        </button>
                                        <button className="btn btn-default">
                                            <span className="ti-trash"/>
                                        </button>
                                    </div>
                                }
                            </td>
                        </tr>
                    )) : <tr>No Subscriptions Found</tr>}
                    <tr className={showNewSubscriptionBox ? 'non-highlight-row subscription-row' : 'hidden'}>
                        <td>
                            <select className="alert-details__select" ref={this.setSelectRef}>
                                <option>Slack</option>
                                <option>Email</option>
                            </select>
                        </td>
                        <td>
                            <input
                                className="alert-details__input"
                                placeholder="Medium Handle"
                                onKeyDown={event => AlertSubscriptions.handleInputKeypress(event, this.toggleNewSubscriptionBox, this.handleSubmit)}
                                ref={this.setNewInputRef}
                            />
                        </td>
                        <td>
                            <div className="btn-group btn-group-sm">
                                <button className="btn btn-success" onClick={this.handleSubmit}>
                                    <span className="ti-plus"/>
                                </button>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="text-left subscription-button">
                    {showNewSubscriptionBox ?
                        <button className="btn btn-sm btn-default" onClick={this.toggleNewSubscriptionBox}><div>Hide</div></button> :
                        <button className="btn btn-sm btn-success" onClick={this.toggleNewSubscriptionBox}><span className="ti-plus"/> Add Subscription</button>
                    }
                </div>
                <div className={this.state.subscriptionError ? 'subscription-error' : 'hidden'}>Error adding subscription</div>
            </section>
        );
    }

}
