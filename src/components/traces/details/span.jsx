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
            startTime: PropTypes.number.isRequired,
            totalDuration: PropTypes.number.isRequired,
            maxDepth: PropTypes.number.isRequired,
            spanHeight: PropTypes.number.isRequired,
            timelineWidthPercent: PropTypes.number.isRequired,
            timePointersHeight: PropTypes.number.isRequired,
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
            startTime,
            totalDuration,
            spanHeight,
            maxDepth,
            timelineWidthPercent,
            timePointersHeight
        } = this.props;

        const {
            serviceName,
            depth,
            expandable,
            expanded
        } = span;

        // coordinates
        const rowHeight = 10;
        const rowPadding = 12;
        const paddingVertical = 4;
        const topOffset = (index * (rowHeight + (rowPadding * 2))) + rowPadding + timePointersHeight + 2;


        //
        const serviceLabelWidthPerc = 100 - timelineWidthPercent;
        const spanTimestamp = span.startTime;
        const spanDuration = span.duration;
        const leftOffset = ((((((spanTimestamp - startTime) / totalDuration) * 100) * (timelineWidthPercent / 100)) + serviceLabelWidthPerc));
        const width = ((spanDuration / totalDuration) * 100) * (timelineWidthPercent / 100);
        const formattedDuration = `${formatters.toDurationMsString(span.duration)}`;
        const invocationLines = [];
        for (let i = depth; i > 0; i -= 1) {
            invocationLines.push(<line
                className="timeline-transition"
                x1={`${(i * 2) + 10.6}%`}
                x2={`${(i * 2) + 10.6}%`}
                y1={topOffset - 18}
                y2={topOffset + 10}
                fill="black"
                strokeWidth="2"
                strokeDasharray="3, 5"
                stroke="black"
                strokeOpacity="0.3"
                key={Math.random()}
            />);
        }

        // service name text
        const maxServiceChars = 24 - (maxDepth * 3);
        const trimmedServiceName = serviceName.length > maxServiceChars ? `${serviceName.substr(0, maxServiceChars)}...` : serviceName;
        const serviceLabelWidth = (maxServiceChars * 7);
        // TODO add tooltip text
        const ServiceName = (
            <g>
                {span.expandable ? (<text x={`${depth}%`} y={topOffset + 8}>{span.expanded ? '-' : '+'}</text>) : null}
                <rect
                    className={`${serviceColor.toFillClass(serviceName)}`}
                    height={20}
                    y={topOffset - 6}
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
                    y={topOffset + (paddingVertical * 2)}
                    clipPath="url(#overflow)"
                >{trimmedServiceName}
                </text>
            </g>);

        return (
            <g>
                <line
                    className="timeline-transition"
                    x1={`${(depth * 2) + 11}%`}
                    x2={`${leftOffset}%`}
                    y1={topOffset + 10}
                    y2={topOffset + 10}
                    fill="black"
                    strokeWidth="2"
                    strokeDasharray="3, 5"
                    stroke="black"
                    strokeOpacity="0.3"
                />

                {invocationLines}
                {ServiceName}

                <text
                    className="span-label"
                    x={leftOffset > 50 ? `${leftOffset + width}%` : `${leftOffset}%`}
                    y={topOffset}
                    textAnchor={leftOffset > 50 ? 'end' : 'start'}
                >{span.operationName}:{formattedDuration}
                </text>
                <rect
                    className="span-bar"
                    id={span.traceId}
                    height={9}
                    width={`${Math.max(width, 0.2)}%`}
                    x={`${leftOffset}%`}
                    y={topOffset + paddingVertical}
                    rx="3.5"
                    ry="3.5"
                    fill={Span.getSpanSuccess(span) === 'false' ? '#e51c23' : '#3f4d71'}
                />
                {expandable
                    ? (<text x={`${depth}%`} y={topOffset + (paddingVertical * 2)}>{expanded ? '-' : '+'}</text>)
                    : null }
                {(expandable === true)
                    ? <rect
                        className="timeline-transition span-click"
                        id={span.spanId}
                        width={`${serviceLabelWidthPerc}%`}
                        x="0%"
                        y={topOffset - 13}
                        height={rowHeight + (paddingVertical * 5)}
                        onClick={this.toggleChild}
                    />
                    : null }
                <rect
                    className="timeline-transition span-click"
                    width={`${timelineWidthPercent}%`}
                    x={`${serviceLabelWidthPerc}%`}
                    y={topOffset - 13}
                    height={rowHeight + (paddingVertical * 5)}
                    onClick={this.openModal}
                />
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
                        width={`${serviceLabelWidthPerc - 1.5}%`}
                    />
                </clipPath>
            </g>
        );
    }
}
