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
import {PropTypes as MobxPropTypes} from 'mobx-react';

import colorMapper from '../../../../utils/serviceColorMapper';
import linkBuilder from '../../../../utils/linkBuilder';
import formatters from '../../../../utils/formatters';

export default class RelatedTracesRow extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired,
        spanCount: PropTypes.number.isRequired,
        startTime: PropTypes.number.isRequired,
        rootError: PropTypes.bool.isRequired,
        services: MobxPropTypes.observableArray, // eslint-disable-line react/require-default-props
        duration: PropTypes.number.isRequired,
        isUniversalSearch: PropTypes.bool.isRequired
    };

    static openTrendDetailInNewTab(traceId, serviceName, operationName, isUniversalSearch) {
        let traceUrl = '';
        if (isUniversalSearch) {
            const search = {traceId}; // TODO add specific time for trace
            traceUrl = linkBuilder.withAbsoluteUrl(linkBuilder.universalSearchTracesLink(search));
        } else {
            traceUrl = linkBuilder.withAbsoluteUrl(linkBuilder.createTracesLink({
                serviceName,
                operationName,
                traceId
            }));
        }

        const tab = window.open(traceUrl, '_blank');
        tab.focus();
    }

    // Formatters copied from trace ResultsTable.jsx and then refactored into jsx.
    // START TIME
    static timeColumnFormatter(startTime) {
        return (<div>
                    <div className="table__primary">{formatters.toTimeago(startTime)}</div>
                    <div className="table__secondary">{formatters.toTimestring(startTime)}</div>
                </div>);
    }
    // ROOT SUCCESS
    static errorFormatter(cell) {
        const status = cell ? 'error' : 'success';
        return (<div className="table__status">
            <img src={`/images/${status}.svg`} alt={status} height="24" width="24" />
        </div>);
    }
    // TOTAL DURATION
    static totalDurationColumnFormatter(duration) {
        return <div className="table__primary-duration text-right">{formatters.toDurationString(duration)}</div>;
    }
    // SPAN COUNT
    static handleServiceList(services) {
        const serviceList = services.slice(0, 2).map(svc =>
            <span key={svc.name} className={'service-spans label ' + colorMapper.toBackgroundClass(svc.name)}>{svc.name +' x' + svc.spanCount}</span> // eslint-disable-line
        );

        if (services.length > 2) {
            serviceList.push(<span key="extra">...</span>);
        }
        return serviceList;
    }
    static spanColumnFormatter(spanCount, services) {
        return (<div>
                    <div className="table__primary">{spanCount}</div>
                    <div>{RelatedTracesRow.handleServiceList(services)}</div>
                </div>);
    }


    render() {
        const {traceId, serviceName, operationName, spanCount, services, startTime, rootError, duration, isUniversalSearch} = this.props;

        return (
            <tr onClick={() => RelatedTracesRow.openTrendDetailInNewTab(traceId, serviceName, operationName, isUniversalSearch)}>
                <td className="trace-trend-table_cell">
                    {RelatedTracesRow.timeColumnFormatter(startTime)}
                </td>
                <td className="trace-trend-table_cell">
                <div className={`service-spans label label-default ${colorMapper.toBackgroundClass(serviceName)}`}>{serviceName}</div>
                    <div className="trace-trend-table_op-name">{operationName}</div>
                </td>
                <td className="trace-trend-table_cell">
                    {RelatedTracesRow.errorFormatter(rootError)}
                </td>
                <td className="trace-trend-table_cell">
                    {RelatedTracesRow.spanColumnFormatter(spanCount, services)}
                </td>
                <td className="trace-trend-table_cell">
                    {RelatedTracesRow.totalDurationColumnFormatter(duration)}
                </td>
            </tr>
        );
    }
}
