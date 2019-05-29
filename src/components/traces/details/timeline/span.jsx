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
import {observer} from 'mobx-react';

import SpanDetailsModal from './spanDetailsModal';
import formatters from '../../../../utils/formatters';
import serviceColor from '../../../../utils/serviceColorMapper';
import auxillaryTags from '../../utils/auxiliaryTags';

@observer
export default class Span extends React.Component {
    static get propTypes() {
        return {
            startTime: PropTypes.number.isRequired,
            index: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.number.isRequired,
            spanHeight: PropTypes.number.isRequired,
            timelineWidthPercent: PropTypes.number.isRequired,
            timePointersHeight: PropTypes.number.isRequired,
            parentStartTimePercent: PropTypes.number.isRequired,
            parentIndex: PropTypes.number.isRequired,
            toggleExpand: PropTypes.func.isRequired
        };
    }

    static getOffsetPercent(absolutePercent, timelineWidthPercent) {
        return (((absolutePercent * (timelineWidthPercent / 100)) + (100 - timelineWidthPercent)));
    }

    static getSpanError(span) {
        return !!span.tags.find(
            tag => (tag.key === 'error' && (tag.value === true || (typeof tag.value === 'string' && tag.value !== 'false')))
        );
    }

    static getTagValue(span, tagName) {
        const tag = span.tags.find(t => (t.key === tagName));
        return tag && tag.value;
    }

    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.toggleChild = this.toggleChild.bind(this);
    }
    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen: false});
    }
    toggleChild() {
        this.props.toggleExpand(this.props.span.spanId);
    }

    render() {
        const {
            index,
            span,
            totalDuration,
            spanHeight,
            timelineWidthPercent,
            timePointersHeight,
            parentStartTimePercent,
            parentIndex,
            startTime
        } = this.props;

        const {
            serviceName,
            depth,
            expandable,
            expanded,
            startTimePercent,
            duration,
            operationName
        } = span;

        const depthFactor = depth * 0.5;

        // coordinates
        const verticalPadding = 6;
        const topY = timePointersHeight + (index * spanHeight);

        // service pills
        const pillHeight = spanHeight - (2 * verticalPadding);
        const serviceNameBaseline = topY + verticalPadding + (pillHeight - 8);
        const maxServiceChars = 14;
        const serviceLabelWidth = (maxServiceChars * 7.5);
        const trimmedServiceName = serviceName.length > maxServiceChars ? `${serviceName.substr(0, maxServiceChars)}...` : serviceName;

        // merged span indicator
        const isMergedSpan = Span.getTagValue(span, auxillaryTags.IS_MERGED_SPAN);
        const isAutoGenerated = Span.getTagValue(span, auxillaryTags.IS_AUTOGENERATED_SPAN);
        const clientServiceName = Span.getTagValue(span, auxillaryTags.CLIENT_SERVICE_NAME);
        const clientOperationName = Span.getTagValue(span, auxillaryTags.CLIENT_OPERATION_NAME);

        const fullOperationName = isMergedSpan ?
            `${clientServiceName}: ${clientOperationName} + ${serviceName}: ${operationName}` :
            operationName;

        const ServiceName = (
            <g>
                {
                    isMergedSpan &&
                    <rect
                        className={`service-pill ${serviceColor.toFillClass(clientServiceName)}`}
                        height={pillHeight}
                        width={serviceLabelWidth}
                        y={topY + verticalPadding + 6}
                        x={`${depthFactor + 2 + 0.5}%`}
                        clipPath="url(#overflow)"
                    />
                }
                <rect
                    className={`service-pill ${serviceColor.toFillClass(serviceName)}`}
                    height={pillHeight}
                    width={serviceLabelWidth}
                    y={topY + verticalPadding}
                    x={`${depthFactor + 2}%`}
                    clipPath="url(#overflow)"
                />
                <text
                    className="span-service-label"
                    x={`${depthFactor + 2.5}%`}
                    y={serviceNameBaseline}
                    clipPath="url(#overflow)"
                >{trimmedServiceName}
                </text>
            </g>);

        // span bar
        const leftOffsetPercent = Span.getOffsetPercent(startTimePercent, timelineWidthPercent);
        const spanWidthPercent = ((duration / totalDuration) * 100) * (timelineWidthPercent / 100);
        const formattedDuration = `${formatters.toDurationString(duration)}`;
        const SpanBar = (<g>
            <text
                className={Span.getSpanError(span) ? 'span-label span-label_failure' : 'span-label'}
                x={leftOffsetPercent > 70 ? `${leftOffsetPercent + spanWidthPercent}%` : `${leftOffsetPercent}%`}
                y={topY + (verticalPadding * 2)}
                textAnchor={leftOffsetPercent > 70 ? 'end' : 'start'}
            >{fullOperationName} [ {formattedDuration} ]
            </text>
            <rect
                id={span.traceId}
                className={Span.getSpanError(span) ? 'span-bar span-bar_failure' : 'span-bar'}
                height={9}
                width={`${Math.max(spanWidthPercent, 0.4)}%`}
                x={leftOffsetPercent < 99.6 ? `${leftOffsetPercent}%` : '99.6%'}
                y={topY + (verticalPadding * 3)}
            />
            <rect
                className="span-click"
                width="100%"
                height={spanHeight}
                x={0}
                y={topY}
                onClick={this.openModal}
            >
                <title>{fullOperationName}</title>
            </rect>
        </g>);


        // client span bar
        const clientDuration = isMergedSpan && Span.getTagValue(span, auxillaryTags.CLIENT_DURATION);
        const clientStartTime = isMergedSpan && Span.getTagValue(span, auxillaryTags.CLIENT_START_TIME);
        const clientStartTimePercent = isMergedSpan && (((clientStartTime - startTime) / totalDuration) * 100);
        const clientLeftOffsetPercent = isMergedSpan && Span.getOffsetPercent(clientStartTimePercent, timelineWidthPercent);
        const clientSpanWidthPercent = isMergedSpan && ((clientDuration / totalDuration) * 100) * (timelineWidthPercent / 100);
        const clientSpanId = isMergedSpan && Span.getTagValue(span, auxillaryTags.CLIENT_SPAN_ID);

        const ClientSpanBar = isMergedSpan && (<g>
                <rect
                    id={span.traceId}
                    className="span-bar span-bar_client"
                    height={9}
                    width={`${clientSpanWidthPercent}%`}
                    x={`${clientLeftOffsetPercent}%`}
                    y={topY + (verticalPadding * 3)}
                />
            </g>);

        // invocation lines
        const horizontalLineY = topY + (verticalPadding * 3.8);
        const parentOffsetPercent = Span.getOffsetPercent(parentStartTimePercent, timelineWidthPercent);
        const InvocationLines = (<g>
            <line
                className="invocation-line"
                x1={`${parentOffsetPercent}%`}
                x2={`${parentOffsetPercent}%`}
                y1={(parentIndex * spanHeight) + timePointersHeight + (verticalPadding * 3.8)}
                y2={horizontalLineY}
            />
            <line
                className="invocation-line"
                x1={`${parentOffsetPercent}%`}
                x2={`${leftOffsetPercent}%`}
                y1={horizontalLineY}
                y2={horizontalLineY}
            />
        </g>);

        return (
            <g>
                <rect
                    className="span-row"
                    width="100%"
                    height={spanHeight}
                    x="0"
                    y={topY}
                    onClick={this.openModal}
                />

                {ClientSpanBar}
                {InvocationLines}
                {ServiceName}
                {SpanBar}
                {expandable
                    ? <g>
                        <rect
                            id={span.spanId}
                            className="service-expand-pill"
                            height={pillHeight - 4}
                            width={18}
                            x={`${depthFactor + 0.1}%`}
                            y={topY + verticalPadding + 2}
                            onClick={this.toggleChild}
                        />
                        <text
                            className="service-expand-text"
                            x={`${depthFactor + 0.4}%`}
                            y={serviceNameBaseline + 2}
                            onClick={this.toggleChild}
                        >{expanded ? '-' : '+'}</text>
                    </g>
                    : null }
                <SpanDetailsModal
                    isOpen={this.state.modalIsOpen}
                    closeModal={this.closeModal}
                    span={span}
                    startTime={startTime}
                    clientServiceName={clientServiceName}
                    fullOperationName={fullOperationName}
                    clientSpanId={clientSpanId}
                    isAutoGenerated={isAutoGenerated}
                    isMergedSpan={isMergedSpan}
                />
                <clipPath id="overflow">
                    <rect
                        x="0"
                        height="100%"
                        width={`${100 - timelineWidthPercent - 0.2}%`}
                    />
                </clipPath>
            </g>
        );
    }
}
