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

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {observer} from 'mobx-react';

import TagsTable from './tagsTable';
import LogsTable from './logsTable';
import RawSpan from './rawSpan';
import Modal from '../../../common/modal';
import rawSpanStore from '../../stores/rawSpanStore';
import formatters from '../../../../utils/formatters';
import linkBuilder from '../../../../utils/linkBuilder';

const SpanDetailsModal = observer(({
    isOpen,
    closeModal,
    span,
    startTime,
    clientServiceName,
    fullOperationName,
    clientSpanId,
    isAutoGenerated,
    isMergedSpan
}) => {
    const [selectedTab, setSelectedTab] = useState(1);

    const tabViewer = () => {
        switch (selectedTab) {
            case 1:
                return <TagsTable tags={span.tags} />;
            case 2:
                return <LogsTable logs={span.logs} startTime={startTime} />;
            case 3:
                rawSpanStore.fetchRawSpan(span.traceId, span.spanId, span.serviceName);
                return <RawSpan rawSpanStore={rawSpanStore}/>;
            case 4:
                rawSpanStore.fetchRawSpan(span.traceId, clientSpanId, clientServiceName);
                return <RawSpan rawSpanStore={rawSpanStore}/>;
            default:
                return null;
        }
    };

    const subsystems = window.haystackUiConfig.subsystems;
    const operationTitle = `${fullOperationName}: ${formatters.toDurationString(span.duration)}`;
    const fullTitle = isMergedSpan ? `Merged Span - ${operationTitle}` : operationTitle;
    const serviceName = span.serviceName;
    return (
        <Modal
            serviceName={serviceName}
            title={fullTitle}
            isOpen={isOpen}
            closeModal={closeModal}
            clientServiceName={clientServiceName}
        >
            <div className="tabs-nav-container clearfix">
                <ul className="nav nav-tabs pull-left">
                    <li className={selectedTab === 1 ? 'active' : ''}>
                        <a role="button" tabIndex="-2" className="tags-tab" onClick={() => setSelectedTab(1)} >
                            {isMergedSpan ? 'Merged Tags' : 'Tags'}
                        </a>
                    </li>
                    <li className={selectedTab === 2 ? 'active' : ''}>
                        <a role="button" className="log-tab" tabIndex="-1" onClick={() => setSelectedTab(2)} >
                            {isMergedSpan ? 'Merged Logs' : 'Logs'}
                        </a>
                    </li>
                    {   !isAutoGenerated &&
                    <li className={selectedTab === 3 ? 'active' : ''}>
                        <a role="button" tabIndex="-3" className="raw-tab" onClick={() => setSelectedTab(3)}>
                            {isMergedSpan ? 'Raw Server Span' : 'Raw Span'}
                        </a>
                    </li>
                    }
                    { isMergedSpan && (
                        <li className={selectedTab === 4 ? 'active' : ''}>
                            <a role="button" tabIndex="-4" className="raw-tab" onClick={() => setSelectedTab(4)} >Raw Client Span</a>
                        </li>
                    )}
                </ul>
                { subsystems && subsystems.includes('trends')
                    ? (<div className="btn-group-sm pull-right">
                        <Link
                            className="btn btn-primary"
                            to={
                                linkBuilder.universalSearchTrendsLink({
                                    query_1: {
                                        serviceName,
                                        operationName: span.operationName
                                    }
                                })
                            }
                        >
                            <span className="ti-stats-up"/> Operation Trends
                        </Link>
                    </div>) : null}
            </div>
            {tabViewer(span)}
        </Modal>
    );
});

SpanDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    span: PropTypes.object.isRequired,
    startTime: PropTypes.number.isRequired,
    clientServiceName: PropTypes.string,
    fullOperationName: PropTypes.string,
    clientSpanId: PropTypes.string,
    isAutoGenerated: PropTypes.bool,
    isMergedSpan: PropTypes.bool
};

SpanDetailsModal.defaultProps = {
    clientServiceName: null,
    fullOperationName: null,
    clientSpanId: null,
    isAutoGenerated: false,
    isMergedSpan: false
};

export default SpanDetailsModal;

