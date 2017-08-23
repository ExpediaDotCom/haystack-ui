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


@observer
export default class TraceDetails extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired
    };

    componentDidMount() {
        activeTraceStore.fetchTraceDetails(this.props.traceId);
    }

    render() {
        const rowChildren = activeTraceStore.spans.map((span, index) =>
            (<TraceDetailsRow
                key={span.id}
                index={index}
                startTime={activeTraceStore.startTime}
                rowHeight={18}
                rowPadding={5}
                span={span}
                totalDuration={activeTraceStore.totalDuration}
            />));

        return (
            <section className="trace-details">
                <div className="trace-details-nav">
                    <h4>Timeline</h4>
                    <div className="trace-details-toolbar btn-group">
                        <a className="btn btn-default"><span className="trace-details-toolbar-option-icon ti-share"/> Raw Trace</a>
                        <a className="btn btn-primary"><span className="trace-details-toolbar-option-icon ti-link"/> Copy Link</a>
                    </div>
                </div>
                <div>
                    <h4>{this.props.traceId}</h4>
                    { activeTraceStore.promiseState && activeTraceStore.promiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        fulfilled: () => ((activeTraceStore.spans && activeTraceStore.spans.length)
                            ? (<svg className="trace-details-graph">{rowChildren}</svg>)
                             : <Error />)
                    })
                    }
                </div>
            </section>
        );
    }
}
