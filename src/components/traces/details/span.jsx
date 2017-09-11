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

import SpanDetailsModal from './spanDetailsModal';

export default class Span extends React.Component {

    static get propTypes() {
        return {
            index: PropTypes.number.isRequired,
            startTime: PropTypes.number.isRequired,
            rowHeight: PropTypes.number.isRequired,
            rowPadding: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.string.isRequired,
            serviceName: PropTypes.string.isRequired,
            spanDepth: PropTypes.number.isRequired
        };
    }
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }
    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen: false});
    }

    render() {
        const {
            index,
            startTime,
            rowHeight,
            rowPadding,
            span,
            totalDuration,
            serviceName,
            spanDepth
        } = this.props;
        const topOffset = (index * (rowHeight + (rowPadding * 2))) + (rowPadding * 2) + 30; // Additional 30 px for timepointer
        const spanTimestamp = span.startTime;
        const spanDuration = span.duration;
        const leftOffset = (((((spanTimestamp - startTime) / totalDuration) * 100) * 0.8) + 12); // 0.8 factor is for scaling svg width to 80%
        const width = ((spanDuration / totalDuration) * 100) * 0.8;
        const formattedDuration = `${span.duration / 1000}ms`;
        return (
            <g>
                <text
                    className="span-service-label"
                    fill="#6B7693"
                    x={`${spanDepth}%`}
                    y={topOffset}
                    clipPath="url(#overflow)"
                    cursor="default"
                >{serviceName}
                </text>
                <text
                    className="span-label"
                    fill="#6B7693"
                    x={leftOffset > 50 ? `${leftOffset + width}%` : `${leftOffset}%`}
                    y={topOffset}
                    textAnchor={leftOffset > 50 ? 'end' : 'start'}
                    cursor="default"
                >{span.operationName}:{formattedDuration}
                </text>
                <rect
                    className="btn span-bar"
                    id={span.traceId}
                    height={rowHeight}
                    width={`${Math.max(width, 0.2)}%`}
                    x={`${leftOffset}%`}
                    y={topOffset + 4}
                    rx="3.5"
                    ry="3.5"
                    fill="#4CAF50"
                />
                <rect
                    className="span-click"
                    width="100%"
                    x="0"
                    y={topOffset - 13}
                    height={rowHeight + 20}
                    onClick={this.openModal}
                />
                <SpanDetailsModal
                    isOpen={this.state.modalIsOpen}
                    closeModal={this.closeModal}
                    serviceName={serviceName}
                    span={span}
                />
                <clipPath id="overflow">
                    <rect x="0" height="100%" width="11.5%"/>
                </clipPath>
            </g>
        );
    }
}
