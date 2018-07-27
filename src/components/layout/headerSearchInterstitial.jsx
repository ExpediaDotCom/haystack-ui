/*
 * Copyright 2018 Expedia Group
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
import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

import Loading from '../common/loading';
import Error from '../common/error';
import linkBuilder from '../../utils/linkBuilder';

@observer
export default class HeaderSearchInterstitial extends React.Component {
    static propTypes = {
        traceDetailsStore: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.props.traceDetailsStore.fetchTraceDetails(this.props.match.params.traceId);
    }

    componentWillReceiveProps(nextProps) {
        this.props.traceDetailsStore.fetchTraceDetails(nextProps.match.params.traceId);
    }

    render() {
            return (
                this.props.traceDetailsStore.promiseState && this.props.traceDetailsStore.promiseState.case({
                    pending: () => <Loading />,
                    rejected: () => <Error errorMessage={`TraceId ${this.props.match.params.traceId} not found.`}/>,
                    fulfilled: () => {
                        if (this.props.traceDetailsStore.spans && this.props.traceDetailsStore.spans.length) {
                            const rootSpan = (this.props.traceDetailsStore.spans.find(span => !span.parentSpanId));
                            return (<Redirect
                                to={
                                    linkBuilder.createTracesLink({
                                        serviceName: rootSpan.serviceName,
                                        operationName: rootSpan.operationName,
                                        traceId: this.props.match.params.traceId
                                    })
                                }
                            />);
                        }
                        return <Error errorMessage={`TraceId ${this.props.match.params.traceId} not found.`}/>;
                    }
                })
            );
    }
}

