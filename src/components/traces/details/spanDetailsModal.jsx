/*
 * Copyright 2017 Expedia, Inc.
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
import {Link} from 'react-router-dom';

import TagsTable from './tagsTable';
import LogsTable from './logsTable';
import Modal from '../../common/modal';

export default class SpanDetailsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabSelected: 1
        };
        this.tabViewer = this.tabViewer.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
    }
    toggleTab(tabIndex) {
        this.setState({tabSelected: tabIndex});
    }
    tabViewer(span) {
        switch (this.state.tabSelected) {
            case 1:
                return <TagsTable binaryAnnotations={span.binaryAnnotations} />;
            case 2:
                return <LogsTable annotations={span.annotations} />;
            case 3:
                return <pre>{JSON.stringify(span, null, 2)}</pre>;
            default:
                return null;
        }
    }

    render() {
        return (
            <Modal
                title={`[${this.props.serviceName}] ${this.props.span.name}: ${this.props.span.duration / 1000}ms`}
                isOpen={this.props.isOpen}
                closeModal={this.props.closeModal}
            >
                <div className="tabs-nav-container clearfix">
                    <ul className="nav nav-tabs pull-left">
                        <li className={this.state.tabSelected === 1 ? 'active' : ''}>
                            <a role="button" tabIndex="-1" onClick={() => this.toggleTab(1)} >Tags</a>
                        </li>
                        <li className={this.state.tabSelected === 2 ? 'active' : ''}>
                            <a role="button" tabIndex="-2" onClick={() => this.toggleTab(2)} >Logs</a>
                        </li>
                        <li className={this.state.tabSelected === 3 ? 'active' : ''}>
                            <a role="button" tabIndex="-3" onClick={() => this.toggleTab(3)} >Raw Span</a>
                        </li>
                    </ul>
                    <div className="btn-group-sm pull-right">
                        <Link className="btn btn-primary" to={`/service/${this.props.serviceName}/trends`}>
                            <span className="ti-stats-up"/> Trends
                        </Link>
                        <Link className="btn btn-primary" to={`/service/${this.props.serviceName}/flow`}>
                            <span className="ti-vector"/> Dependencies
                        </Link>
                    </div>
                </div>
                {this.tabViewer(this.props.span)}
            </Modal>
        );
    }
}

SpanDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    serviceName: PropTypes.string.isRequired,
    span: PropTypes.object.isRequired
};
