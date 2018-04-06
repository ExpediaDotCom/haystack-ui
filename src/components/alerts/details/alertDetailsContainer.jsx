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
import _ from 'lodash';
import {Link} from 'react-router-dom';

import AlertDetailsToolbar from './alertDetailsToolbar';
import formatters from '../../../utils/formatters';

@observer
export default class AlertDetailsContainer extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    };

    static timeAgoFormatter(cell) {
        return formatters.toTimeago(cell);
    }

    static timestampFormatter(cell) {
        return formatters.toTimestring(cell);
    }

    static durationColumnFormatter(start, end) {
        return formatters.toDurationStringInSecAndMin(end - start);
    }

    static getSubscriptionType(subscription) {
        if (subscription.dispatcherType === 'slack') {
            return <div><img src="/images/slack.png" alt="Slack" className="alerts-slack-icon"/> Slack</div>;
        }
        return <div><span className="ti-email"/>  Email</div>;
    }

    constructor(props) {
        super(props);

        this.state = {
            showNewSubscriptionBox: false,
            subscriptionError: false
        };

        this.toggleSubscriptionBox = this.toggleSubscriptionBox.bind(this);
        this.trendLinkCreator = this.trendLinkCreator.bind(this);
        this.traceLinkCreator = this.traceLinkCreator.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSuccessfulNewSubscription = this.handleSuccessfulNewSubscription.bind(this);
        this.handleNewSubscriptionError = this.handleNewSubscriptionError.bind(this);
        this.setInputRef = this.setInputRef.bind(this);
        this.setSelectRef = this.setSelectRef.bind(this);
    }

    setInputRef(node) {
        this.inputRef = node;
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

    handleNewSubscriptionError() {
        this.setState({
            subscriptionError: true
        });
    }

    toggleSubscriptionBox() {
        this.setState(prevState => ({
            showNewSubscriptionBox: !prevState.showNewSubscriptionBox,
            subscriptionError: false
        }));
    }

    handleSubmit() {
        const handle = this.inputRef.value;
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

    trendLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/trends?operationName=^${encodeURIComponent(this.props.operationName)}$&from=${startTimestamp / 1000}&until=${endTimestamp / 1000}`;
    }

    traceLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/traces?operationName=${encodeURIComponent(this.props.operationName)}&startTime=${startTimestamp / 1000}&endTime=${endTimestamp / 1000}`;
    }

    render() {
        const sortedHistoryResults = _.orderBy(this.props.alertDetailsStore.alertHistory, alert => alert.startTimestamp, ['desc']);
        const showSubscriptionBox = this.state.showNewSubscriptionBox;
        // eslint-disable-next-line no-unused-vars
        const Subscription = () => (
            <section className="subscriptions col-md-6">
                <h4>Subscriptions</h4>
                <table className="subscriptions__table table">
                    <thead>
                        <tr>
                            <th width="20%">Medium</th>
                            <th width="60%">Medium Handle</th>
                            <th width="15%">Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.alertDetailsStore.alertSubscriptions.length ? this.props.alertDetailsStore.alertSubscriptions.map(subscription => (
                            <tr className="non-highlight-row subscription-row" key={Math.random()}>
                                <td>{AlertDetailsContainer.getSubscriptionType(subscription)}</td>
                                <td>{subscription.dispatcherIds[0]}</td>
                                <td>
                                    <div className="btn-group btn-group-sm">
                                        <Link to={'#'} className="btn btn-default">
                                            <span className="ti-pencil"/>
                                        </Link>
                                        <Link to={'#'} className="btn btn-default">
                                            <span className="ti-trash"/>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )) : <tr>No Subscriptions Found</tr>}
                        <tr className={showSubscriptionBox ? 'non-highlight-row subscription-row' : 'hidden'}>
                            <td>
                                <select className="alert-details__select" ref={this.setSelectRef}>
                                    <option>Slack</option>
                                    <option>Email</option>
                                </select>
                            </td>
                            <td>
                                <input className="alert-details__input" placeholder="Medium Handle" ref={this.setInputRef}/>
                            </td>
                            <td>
                                <div className="btn-group btn-group-sm">
                                    <Link to={'#'} className="btn btn-success" onClick={this.handleSubmit}>
                                        <span className="ti-plus"/>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="text-left subscription-button">
                    {showSubscriptionBox ?
                        <button className="btn btn-sm btn-default" onClick={this.toggleSubscriptionBox}><div>Hide</div></button> :
                        <button className="btn btn-sm btn-success" onClick={this.toggleSubscriptionBox}><span className="ti-plus"/> Add Subscription</button>
                    }
                </div>
                <div className={this.state.subscriptionError ? 'subscription-error' : 'hidden'}>Error adding subscription</div>
            </section>
        );

        const History = () => (
            <div className="col-md-6">
                <h4>History</h4>
                <table className="table">
                    <thead>
                    <tr>
                        <th width="50%">Start Time</th>
                        <th width="20%" className="text-right">Duration</th>
                        <th width="30%" className="text-right">See Trends & Traces</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedHistoryResults.length ? sortedHistoryResults.map(alert =>
                        (<tr className="non-highlight-row" key={Math.random()}>
                            <td><span className="alerts__bold">{AlertDetailsContainer.timeAgoFormatter(alert.startTimestamp)}</span> at {AlertDetailsContainer.timestampFormatter(alert.startTimestamp)}</td>
                            <td className="text-right"><span className="alerts__bold">{AlertDetailsContainer.durationColumnFormatter(alert.startTimestamp, alert.endTimestamp)}</span></td>
                            <td className="text-right">
                                <div className="btn-group btn-group-sm">
                                    <Link to={this.trendLinkCreator(alert.startTimestamp, alert.endTimestamp)} className="btn btn-default">
                                        <span className="ti-stats-up"/>
                                    </Link>
                                    <Link to={this.traceLinkCreator(alert.startTimestamp, alert.endTimestamp)} className="btn btn-sm btn-default">
                                        <span className="ti-align-left"/>
                                    </Link>
                                </div>
                            </td>
                        </tr>))
                        : (<tr className="non-highlight-row"><td>No past alert found</td><td/><td/></tr>)
                    }
                    </tbody>
                </table>
            </div>
        );

        return (
            <div className="alert-details-container">
                <div className="clearfix alert-details-container_header">
                    <AlertDetailsToolbar serviceName={this.props.serviceName} operationName={this.props.operationName} type={this.props.type}/>
                </div>
                <div className="row">
                    <History />
                    <Subscription />
                </div>
            </div>
        );
    }

}
