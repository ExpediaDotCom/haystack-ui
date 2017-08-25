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

export default class TraceDetailsRow extends React.Component {

    static get propTypes() {
        return {
            index: PropTypes.number.isRequired,
            startTime: PropTypes.number.isRequired,
            rowHeight: PropTypes.number.isRequired,
            rowPadding: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.number.isRequired
        };
    }


    render() {
        const {
            index,
            startTime,
            rowHeight,
            rowPadding,
            span,
            totalDuration
        } = this.props;
        const topOffset = (index * (rowHeight + (rowPadding * 2))) + (rowPadding * 2);
        const spanTimestamp = span.timestamp;
        const spanDuration = span.duration;
        const leftOffset = ((spanTimestamp - startTime) / totalDuration) * 100;
        const width = ((spanDuration / totalDuration) * 100);
        const formattedDuration = `${span.duration / 1000}ms`;
        return (
            <g>
                <rect
                    className="btn"
                    id={span.traceId}
                    height={rowHeight}
                    width={`${Math.max(width, 0.2)}%`}
                    x={`${leftOffset}%`}
                    y={topOffset}
                    fill="#4CAF50"
                />
                <text
                    className="trace-svg-text"
                    fill="#6B7693"
                    x={`${leftOffset + width + 0.3}%`}
                    y={topOffset + 14}
                >{formattedDuration}</text>
            </g>
        );
    }
}
