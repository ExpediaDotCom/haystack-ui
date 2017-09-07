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
import './traceDetails.less';
import Loading from '../../common/loading';
import Error from '../../common/error';
import activeTraceStore from '../../../stores/activeTraceStore';
import RawTraceModal from './rawTraceModal';
import Timeline from './timeline';

@observer
export default class TraceDetails extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            timelineTabSelected: true
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
    }

    componentDidMount() {
        activeTraceStore.fetchTraceDetails(this.props.traceId);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    toggleTab() {
        const timelineTabSelected = this.state.timelineTabSelected;
        this.setState({timelineTabSelected: !timelineTabSelected});
    }


    render() {
        const InvocationWaterfall = () => (<div>To Add Waterfall</div>);

        return (
            <section className="trace-details">
                <div className="trace-details-nav clearfix">
                    <ul className="nav nav-tabs pull-left">
                        <li className={this.state.timelineTabSelected ? 'active' : ''}>
                            <a role="button" tabIndex="-1" onClick={this.toggleTab} >Timeline</a>
                        </li>
                        <li className={this.state.timelineTabSelected ? '' : 'active'}>
                            <a role="button" tabIndex="-1" onClick={this.toggleTab} >Invocations</a>
                        </li>
                    </ul>
                    <div className="trace-details-toolbar btn-group-sm pull-right">
                        <a role="button" className="btn btn-default" onClick={this.openModal} tabIndex="-1"><span className="trace-details-toolbar-option-icon ti-share"/> Raw Trace</a>
                        <a role="button" className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Copy Link</a>
                    </div>
                </div>
                {
                    (this.state.timelineTabSelected) ?
                        (<div className="trace-details-timeline">
                            { activeTraceStore.promiseState && activeTraceStore.promiseState.case({
                                    pending: () => <Loading />,
                                    rejected: () => <Error />,
                                    fulfilled: () => ((activeTraceStore.spans && activeTraceStore.spans.length)
                                        ? (<Timeline totalDuration={activeTraceStore.totalDuration} startTime={activeTraceStore.startTime} timePointers={activeTraceStore.timePointers} spans={activeTraceStore.spans}/>)
                                        : <Error />)
                                })
                            }
                        </div>) :
                        <InvocationWaterfall/>
                }



                <RawTraceModal isOpen={this.state.modalIsOpen} closeModal={this.closeModal} spans={activeTraceStore.spans}/>
            </section>
        );
    }
}
