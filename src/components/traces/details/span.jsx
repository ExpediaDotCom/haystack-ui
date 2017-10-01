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

/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import SpanDetailsModal from './spanDetailsModal';
import formatters from '../../../utils/formatters';
import serviceColor from '../../../utils/serviceColorMapper';

@observer
export default class Span extends React.Component {
    static get propTypes() {
        return {
            index: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.number.isRequired,
            maxDepth: PropTypes.number.isRequired,
            spanHeight: PropTypes.number.isRequired,
            timelineWidthPercent: PropTypes.number.isRequired,
            timePointersHeight: PropTypes.number.isRequired,
            parentStartTimePercent: PropTypes.number.isRequired,
            toggleExpand: PropTypes.func.isRequired
        };
    }

    static getSpanSuccess(span) {
        const successTag = (span.tags.find(tag => (tag.key === 'success')));
        if (successTag !== undefined) {
            return successTag.value;
        }
        return null;
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
            maxDepth,
            timelineWidthPercent,
            timePointersHeight,
            parentStartTimePercent
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

        // coordinates
        const verticalPadding = 6;
        const topY = timePointersHeight + (index * spanHeight);

        // invocation lines
        const invocationLines = [];
        for (let i = depth; i > 0; i -= 1) {
            invocationLines.push(<line
                className="timeline-transition"
                x1={`${(i * 2) + 10.6}%`}
                x2={`${(i * 2) + 10.6}%`}
                y1={topY}
                y2={topY + (verticalPadding * 4.5)}
                fill="black"
                strokeWidth="2"
                strokeDasharray="3, 5"
                stroke="black"
                strokeOpacity="0.3"
                key={Math.random()}
            />);
        }

        // service pills
        const pillHeight = spanHeight - (2 * verticalPadding);
        const maxServiceChars = 24 - (maxDepth * 3);
        const serviceNameBaseline = topY + verticalPadding + (pillHeight - 8);
        const trimmedServiceName = serviceName.length > maxServiceChars ? `${serviceName.substr(0, maxServiceChars)}...` : serviceName;
        const serviceLabelWidth = (maxServiceChars * 7);
        // TODO add tooltip text
        const ServiceName = (
            <g>
                {expandable
                    ? <text x={`${depth}%`} y={serviceNameBaseline}>{expanded ? '-' : '+'}</text>
                    : null }
                <rect
                    className={`${serviceColor.toFillClass(serviceName)}`}
                    height={pillHeight}
                    y={topY + verticalPadding}
                    x={`${depth + 1}%`}
                    width={serviceLabelWidth}
                    rx="3.5"
                    ry="3.5"
                    fillOpacity="0.8"
                    clipPath="url(#overflow)"
                />
                <text
                    className="span-service-label"
                    x={`${depth + 1.5}%`}
                    y={serviceNameBaseline}
                    clipPath="url(#overflow)"
                >{trimmedServiceName}
                </text>
                {expandable
                    ? <rect
                        className="span-click"
                        id={span.spanId}
                        width={`${100 - timelineWidthPercent}%`}
                        x="0%"
                        y={topY}
                        height={spanHeight}
                        onClick={this.toggleChild}
                    />
                    : null }
            </g>);

        // span bar
        const leftOffsetPercent = (((startTimePercent * (timelineWidthPercent / 100)) + (100 - timelineWidthPercent)));
        const spanWidthPercent = ((duration / totalDuration) * 100) * (timelineWidthPercent / 100);
        const formattedDuration = `${formatters.toDurationMsString(duration)}`;
        const SpanBar = (<g>
            <text
                className="span-label"
                x={leftOffsetPercent > 50 ? `${leftOffsetPercent + spanWidthPercent}%` : `${leftOffsetPercent}%`}
                y={topY + (verticalPadding * 2)}
                textAnchor={leftOffsetPercent > 50 ? 'end' : 'start'}
            >{operationName}:{formattedDuration}
            </text>
            <rect
                className="span-bar"
                id={span.traceId}
                height={9}
                width={`${Math.max(spanWidthPercent, 0.2)}%`}
                x={`${leftOffsetPercent}%`}
                y={topY + (verticalPadding * 3)}
                rx="3.5"
                ry="3.5"
                fill={Span.getSpanSuccess(span) === 'false' ? '#e51c23' : '#3f4d71'}
            />
            <rect
                className="span-click"
                x={`${100 - timelineWidthPercent}%`}
                y={topY}
                width={`${timelineWidthPercent}%`}
                height={spanHeight}
                onClick={this.openModal}
            />
        </g>);

        return (
            <g>
                <line
                    className="timeline-transition"
                    x1={`${(depth * 2) + 11}%`}
                    x2={`${leftOffsetPercent}%`}
                    y1={topY + (verticalPadding * 4)}
                    y2={topY + (verticalPadding * 4)}
                    fill="black"
                    strokeWidth="2"
                    strokeDasharray="3, 5"
                    stroke="black"
                    strokeOpacity="0.3"
                />

                {invocationLines}
                {ServiceName}
                {SpanBar}

                <SpanDetailsModal
                    isOpen={this.state.modalIsOpen}
                    closeModal={this.closeModal}
                    serviceName={serviceName}
                    span={span}
                />
                <clipPath id="overflow">
                    <rect
                        x="0"
                        height="100%"
                        width={`${100 - timelineWidthPercent - 1.5}%`}
                    />
                </clipPath>
            </g>
        );
    }
}
