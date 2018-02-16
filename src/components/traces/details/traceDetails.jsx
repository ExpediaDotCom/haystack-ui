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
import Clipboard from 'react-copy-to-clipboard';
import './traceDetails.less';
import Loading from '../../common/loading';
import Error from '../../common/error';
import RawTraceModal from './rawTraceModal';
import Timeline from './timeline';
import Invocations from './invocations';
import rawTraceStore from '../stores/rawTraceStore';
import uiState from '../searchBar/searchBarUiStateStore';

@observer
export default class TraceDetails extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        traceDetailsStore: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            tabSelected: 1
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
    }

    componentDidMount() {
        this.props.traceDetailsStore.fetchTraceDetails(this.props.traceId);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    toggleTab(tabIndex) {
        this.setState({tabSelected: tabIndex});
    }

    handleCopy() {
        this.setState({showCopied: true});
        setTimeout(() => this.setState({showCopied: false}), 2000);
    }

    tabViewer({promiseState, timelineSpans, totalDuration, startTime}) {
        return (<section>
                {
                    promiseState && promiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        fulfilled: () => {
                            if (timelineSpans && timelineSpans.length) {
                                return (this.state.tabSelected === 1) ?
                                    <Timeline
                                        timelineSpans={timelineSpans}
                                        totalDuration={totalDuration}
                                        startTime={startTime}
                                        toggleExpand={this.props.traceDetailsStore.toggleExpand}
                                    /> :
                                    <Invocations/>;
                            }

                            return <Error />;
                        }
                    })
                }
            </section>);
    }

    render() {
        const {traceId, location, traceDetailsStore} = this.props;

        const traceUrl = `${window.location.protocol}//${window.location.host}${location.pathname}?serviceName=${uiState.serviceName}${uiState.operationName ? `&operationName=${uiState.operationName}` : ''}&traceId=${traceId}`;
        return (
            <section className="table-row-details">
                <div className="tabs-nav-container clearfix">
                    <h5 className="pull-left traces-details-trace-id__name">TraceId: <span className="traces-details-trace-id__value">{traceId}</span></h5>
                    <ul className="nav nav-tabs pull-left hidden">
                        <li className={this.state.tabSelected === 1 ? 'active' : ''}>
                            <a role="button" tabIndex="-1" onClick={() => this.toggleTab(1)} >Timeline</a>
                        </li>
                        <li className={this.state.tabSelected === 2 ? 'active' : ''}>
                            <a role="button" tabIndex="-1" onClick={() => this.toggleTab(2)} >Invocations</a>
                        </li>
                    </ul>

                    <div className="btn-group btn-group-sm pull-right">
                          {
                            this.state.showCopied ? (
                                <span className="tooltip fade left in" role="tooltip">
                                    <span className="tooltip-arrow" />
                                    <span className="tooltip-inner">Link Copied!</span>
                                </span>
                            ) : null
                          }
                        <a role="button" className="btn btn-default" onClick={this.openModal} tabIndex="-1"><span className="trace-details-toolbar-option-icon ti-server"/> Raw Trace</a>
                        <a role="button" className="btn btn-sm btn-default" target="_blank" href={traceUrl}><span className="ti-new-window"/> Open in new tab</a>
                        <Clipboard
                            text={traceUrl}
                            onCopy={this.handleCopy}
                        >
                            <a role="button" className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Share Trace</a>
                        </Clipboard>
                    </div>
                </div>
                {this.tabViewer({
                    promiseState: traceDetailsStore.promiseState,
                    timelineSpans: traceDetailsStore.timelineSpans,
                    totalDuration: traceDetailsStore.totalDuration,
                    startTime: traceDetailsStore.startTime
                })}

                <RawTraceModal isOpen={this.state.modalIsOpen} closeModal={this.closeModal} traceId={traceId} rawTraceStore={rawTraceStore}/>
            </section>
        );
    }
}
