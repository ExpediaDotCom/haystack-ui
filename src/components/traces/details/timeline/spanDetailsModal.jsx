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
import {Link} from 'react-router-dom';

import TagsTable from './tagsTable';
import LogsTable from './logsTable';
import RawSpan from './rawSpan';
import Modal from '../../../common/modal';
import rawSpanStore from '../../stores/rawSpanStore';
import formatters from '../../../../utils/formatters';
import linkBuilder from '../../../../utils/linkBuilder';

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
                return <TagsTable tags={span.tags} />;
            case 2:
                return <LogsTable logs={span.logs} startTime={this.props.startTime} />;
            case 3:
                return <RawSpan traceId={span.traceId} spanId={span.spanId} rawSpanStore={rawSpanStore}/>;
            case 4:
                return <RawSpan traceId={span.traceId} spanId={this.props.clientSpanId} rawSpanStore={rawSpanStore}/>;
            default:
                return null;
        }
    }

    render() {
        const subsystems = window.haystackUiConfig.subsystems;
        const title = this.props.fullOperationName ?
            `Merged Span - ${this.props.fullOperationName}: ${formatters.toDurationString(this.props.span.duration)}` :
            `${this.props.span.operationName}: ${formatters.toDurationString(this.props.span.duration)}`;

        return (
            <Modal
                serviceName={this.props.serviceName}
                title={title}
                isOpen={this.props.isOpen}
                closeModal={this.props.closeModal}
                clientServiceName={this.props.clientServiceName}
            >
                <div className="tabs-nav-container clearfix">
                    <ul className="nav nav-tabs pull-left">
                        <li className={this.state.tabSelected === 1 ? 'active' : ''}>
                            <a role="button" tabIndex="-2" className="tags-tab" onClick={() => this.toggleTab(1)} >
                                {this.props.clientServiceName ? 'Merged Tags' : 'Tags'}
                            </a>
                        </li>
                        <li className={this.state.tabSelected === 2 ? 'active' : ''}>
                            <a role="button" className="log-tab" tabIndex="-1" onClick={() => this.toggleTab(2)} >
                                {this.props.clientServiceName ? 'Merged Logs' : 'Logs'}
                            </a>
                        </li>
                        <li className={this.state.tabSelected === 3 ? 'active' : ''}>
                            <a role="button" tabIndex="-3" className="raw-tab" onClick={() => this.toggleTab(3)} >
                                {this.props.clientServiceName ? 'Raw Server Span' : 'Raw Span'}
                            </a>
                        </li>
                        { this.props.clientServiceName && (
                            <li className={this.state.tabSelected === 4 ? 'active' : ''}>
                                <a role="button" tabIndex="-4" className="raw-tab" onClick={() => this.toggleTab(4)} >Raw Client Span</a>
                            </li>
                        )}
                    </ul>
                    { subsystems && (subsystems[0] === 'traces') && (subsystems.length === 1)
                    ? null
                    : (<div className="btn-group-sm pull-right">
                            <Link
                                className="btn btn-primary"
                                to={
                                    linkBuilder.universalSearchTrendsLink({
                                        serviceName: this.props.serviceName,
                                        operationName: this.props.span.operationName
                                    })
                                }
                            >
                                <span className="ti-stats-up"/> Operation Trends
                            </Link>
                        </div>)}
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
    span: PropTypes.object.isRequired,
    startTime: PropTypes.number.isRequired,
    clientServiceName: PropTypes.string,
    fullOperationName: PropTypes.string,
    clientSpanId: PropTypes.string
};

SpanDetailsModal.defaultProps = {
    clientServiceName: null,
    fullOperationName: null,
    clientSpanId: null
};
