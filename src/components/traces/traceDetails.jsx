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
import { observer } from 'mobx-react';
import './traceDetails.less';
import TraceDetailsRow from './traceDetailsRow';
import Loading from '../common/loading';
import Error from '../common/error';
import activeTraceStore from '../../stores/activeTraceStore';
import RawTraceModal from './rawTraceModal';

// TODO :
// - Need to set svgViewBox width automatically which will fix the clipping of operation name

@observer
export default class TraceDetails extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired
    };

    static getServiceName(span) {
        const fromAnnotations = (span.annotations)
            .find(anno =>
            (anno.value !== null)
            && (anno.endpoint !== null)
            && (anno.endpoint.serviceName !== null)
            && (anno.endpoint.serviceName !== ''));
        const serviceFromAnnotations = fromAnnotations ? fromAnnotations.endpoint.serviceName : 'not found';
        if (serviceFromAnnotations) {
            return serviceFromAnnotations;
        }
        return null;
    }
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
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

    render() {
        const rowChildren = activeTraceStore.spans.map((span, index) =>
            (<TraceDetailsRow
                key={span.id}
                index={index}
                startTime={activeTraceStore.startTime}
                rowHeight={12}
                rowPadding={10}
                span={span}
                totalDuration={activeTraceStore.totalDuration}
                serviceName={TraceDetails.getServiceName(span)}
            />));

        const svgHeight = (32 * activeTraceStore.spans.length) + 5;

        return (
            <section className="trace-details">
                <div className="trace-details-nav">
                    <h4>Trace Timeline</h4>
                    <div className="trace-details-toolbar btn-group">
                        <a role="button" className="btn btn-default" onClick={this.openModal} tabIndex="-1"><span className="trace-details-toolbar-option-icon ti-share"/> Raw Trace</a>
                        <a className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Copy Link</a>
                    </div>
                </div>
                <RawTraceModal isOpen={this.state.modalIsOpen} spans={activeTraceStore.spans} closeModal={this.closeModal} />
                <div className="trace-details-graph">
                    { activeTraceStore.promiseState && activeTraceStore.promiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        fulfilled: () => ((activeTraceStore.spans && activeTraceStore.spans.length)
                            ? (<svg height={svgHeight} width="100%" >{rowChildren}</svg>)
                             : <Error />)
                    })
                    }
                </div>
            </section>
        );
    }
}
