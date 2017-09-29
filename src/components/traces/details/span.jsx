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
            startTime: PropTypes.number.isRequired,
            rowHeight: PropTypes.number.isRequired,
            rowPadding: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.number.isRequired,
            toggleExpand: PropTypes.func.isRequired,
            timelineWidthPerc: PropTypes.number.isRequired,
            timePointersHeight: PropTypes.number.isRequired
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
            startTime,
            rowHeight,
            rowPadding,
            span,
            totalDuration,
            timelineWidthPerc,
            timePointersHeight
        } = this.props;

        const {
            serviceName,
            depth,
            expandable,
            expanded
        } = span;

        const paddingVertical = 4;
        const serviceLabelWidthPerc = 12;
        const topOffset = (index * (rowHeight + (rowPadding * 2))) + (rowPadding * 2) + timePointersHeight;
        const spanTimestamp = span.startTime;
        const spanDuration = span.duration;
        const leftOffset = ((((((spanTimestamp - startTime) / totalDuration) * 100) * (timelineWidthPerc / 100)) + serviceLabelWidthPerc));
        const width = ((spanDuration / totalDuration) * 100) * (timelineWidthPerc / 100);
        const formattedDuration = `${formatters.toDurationMsString(span.duration)}`;
        return (
            <g>
                <line
                    x1="10.5%"
                    x2={`${leftOffset - 0.5}%`}
                    y1={topOffset + 10}
                    y2={topOffset + 10}
                    fill="black"
                    strokeWidth="2"
                    strokeDasharray="3, 5"
                    stroke="black"
                    strokeOpacity="0.3"
                />
                <rect
                    className={`span-color-bar ${serviceColor.toFillClass(serviceName)}`}
                    height={20}
                    y={topOffset - 6}
                    x={`${depth + 1}%`}
                    clipPath="url(#overflow)"
                    width={(serviceName.length * 5) + 30} // TODO: calculate color bar width based on service label width
                    rx="3.5"
                    ry="3.5"
                    fillOpacity="0.8"
                />
                <text
                    className="span-service-label"
                    x={`${depth + 1.5}%`}
                    y={topOffset + (paddingVertical * 2)}
                    clipPath="url(#overflow)"
                >{serviceName}
                </text>
                <text
                    className="span-label"
                    x={leftOffset > 50 ? `${leftOffset + width}%` : `${leftOffset}%`}
                    y={topOffset}
                    textAnchor={leftOffset > 50 ? 'end' : 'start'}
                >{span.operationName}:{formattedDuration}
                </text>
                <rect
                    className="btn span-bar"
                    id={span.traceId}
                    height={rowHeight}
                    width={`${Math.max(width, 0.2)}%`}
                    x={`${leftOffset}%`}
                    y={topOffset + paddingVertical}
                    rx="3.5"
                    ry="3.5"
                    fill={Span.getSpanSuccess(span) === 'false' ? '#e51c23' : '#4CAF50'}
                />
                {expandable
                    ? (<text x={`${depth}%`} y={topOffset + (paddingVertical * 2)}>{expanded ? '-' : '+'}</text>)
                    : null }
                {(expandable === true)
                    ? <rect
                        className="span-click"
                        id={span.spanId}
                        width={`${serviceLabelWidthPerc}%`}
                        x="0%"
                        y={topOffset - 13}
                        height={rowHeight + (paddingVertical * 5)}
                        onClick={this.toggleChild}
                    />
                    : null }
                <rect
                    className="span-click"
                    width={`${timelineWidthPerc}%`}
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
