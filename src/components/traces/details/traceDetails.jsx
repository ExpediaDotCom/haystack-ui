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
import RawTraceModal from './rawTraceModal';
import TimelineTabContainer from './timeline/timelineTabContainer';
import LatencyCostTabContainer from './latency/latencyCostTabContainer';
import TrendsTabContainer from './trends/trendsTabContainer';

import rawTraceStore from '../stores/rawTraceStore';
import latencyCostStore from '../stores/latencyCostStore';
import linkBuilder from '../../../utils/linkBuilder';

import uiState from '../searchBar/searchBarUiStateStore';

@observer
export default class TraceDetails extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired,
        traceDetailsStore: PropTypes.object.isRequired
    };

    static tabViewer(traceId, tabSelected, traceDetailsStore) {
        switch (tabSelected) {
            case 2:
                return <LatencyCostTabContainer traceId={traceId} store={latencyCostStore} />;
            case 3:
                return <TrendsTabContainer traceId={traceId} store={traceDetailsStore}/>;
            default:
                return (<TimelineTabContainer traceId={traceId} store={traceDetailsStore} />);
        }
    }

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

    render() {
        const {traceId, traceDetailsStore} = this.props;

        const traceUrl = linkBuilder.withAbsoluteUrl(linkBuilder.createTracesLink({
            serviceName: uiState.serviceName,
            operationName: uiState.operationName,
            traceId
        }));

        return (
            <section className="table-row-details">
                <div className="tabs-nav-container clearfix">
                    <h5 className="pull-left traces-details-trace-id__name">TraceId: <span className="traces-details-trace-id__value">{traceId}</span></h5>
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
                        <Clipboard text={traceUrl} onCopy={this.handleCopy}>
                            <a role="button" className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Share Trace</a>
                        </Clipboard>
                    </div>
                    <div className="trace-details-tabs pull-left full-width">
                        <ul className="nav nav-tabs">
                            <li className={this.state.tabSelected === 1 ? 'active' : ''}>
                                <a role="button" tabIndex="-1" onClick={() => this.toggleTab(1)} >Timeline</a>
                            </li>
                            <li className={this.state.tabSelected === 2 ? 'active' : ''}>
                                    <a role="button" tabIndex="-1" onClick={() => this.toggleTab(2)} >Latency Cost</a>
                            </li>
                            <li className={this.state.tabSelected === 3 ? 'active' : ''}>
                                <a role="button" tabIndex="-1" onClick={() => this.toggleTab(3)} >Trends</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <section>{TraceDetails.tabViewer(traceId, this.state.tabSelected, traceDetailsStore)}</section>

                <RawTraceModal isOpen={this.state.modalIsOpen} closeModal={this.closeModal} traceId={traceId} rawTraceStore={rawTraceStore}/>
            </section>
        );
    }
}
