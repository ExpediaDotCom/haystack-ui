/*
 * Copyright 2018 Expedia Group
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import Modal from '../../common/modal';
import newSubscriptionConstructor from '../utils/subscriptionConstructor';
import './subscriptionModal.less';

@observer
export default class SubscriptionModal extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        submitCallback: PropTypes.func.isRequired,
        interval: PropTypes.string.isRequired,
        dispatchers: PropTypes.array
    };

    static defaultProps = {
        dispatchers: []
    };

    constructor(props) {
        super(props);
        this.state = {
            dispatchers: this.props.dispatchers
        };

        this.editDispatcher = this.editDispatcher.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addDispatcher = this.addDispatcher.bind(this);
        this.deleteDispatcher = this.deleteDispatcher.bind(this);
    }

    editDispatcher(event, dispatcherIndex) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        const dispatchers = this.state.dispatchers;
        dispatchers[dispatcherIndex][name] = value;
        this.setState({
            dispatchers
        });
    }

    handleSubmit() {
        const dispatchers = this.state.dispatchers;

        const subscription = newSubscriptionConstructor(
            this.props.serviceName,
            this.props.operationName,
            this.props.type,
            this.props.interval,
            dispatchers,
        );
        this.props.submitCallback(subscription);
    }

    addDispatcher(e) {
        e.preventDefault();
        const dispatchers = this.state.dispatchers;
        if (dispatchers.length && dispatchers[dispatchers.length - 1].endpoint === '') {
            return; // prevents multiple empty dispatcher boxes
        }
        dispatchers.push({type: 'slack', endpoint: ''});
        this.setState({
            dispatchers
        });
    }

    deleteDispatcher(e, index) {
        e.preventDefault();
        const dispatchers = this.state.dispatchers;
        dispatchers.splice(index, 1);
        this.setState({
            dispatchers
        });
    }

    render() {
        const {isOpen, closeModal, title} = this.props;

        return (
            <Modal isOpen={isOpen} closeModal={closeModal} title={title} height="40%" width="450px">
                <div>
                    <div>
                        <h5 className="dispatcher-header">Dispatchers:</h5>
                        <button className="btn btn-sm btn-info pull-right" onClick={this.addDispatcher}>
                            Add Dispatcher
                        </button>
                        {this.state.dispatchers.map((dispatcher, index) => (
                                <div className="dispatcher-row" key={JSON.stringify(index)}>
                                    <select
                                        className="subscription-select form-control subscription-form"
                                        value={dispatcher.type === 1 ? 'slack' : 'email'}
                                        onChange={e => this.editDispatcher(e, index)}
                                        name="type"
                                    >
                                        <option value="slack">Slack</option>
                                        <option value="email">Email</option>
                                    </select>
                                    <input
                                        className="dispatcher-input form-control subscription-form"
                                        placeholder={dispatcher.type === 1 ? 'Public Slack Channel' : 'Email Address'}
                                        value={dispatcher.endpoint}
                                        onChange={e => this.editDispatcher(e, index)}
                                        name="endpoint"
                                    />
                                    <button className="btn btn-xs btn-danger" onClick={e => this.deleteDispatcher(e, index)}>
                                        <span className="ti-minus"/>
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                    <div className="">
                        <button className="btn btn-sm btn-success" onClick={this.handleSubmit}>
                            <span className="ti-plus"/> {this.props.title}
                        </button>
                    </div>
                </div>
            </Modal>);
    }
}
