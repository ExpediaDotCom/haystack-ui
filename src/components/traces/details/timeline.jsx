/* eslint-disable react/prefer-stateless-function */
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

import Span from './span';

export default class Timeline extends React.Component {

    static get propTypes() {
        return {
            timePointers: PropTypes.object.isRequired,
            spans: PropTypes.object.isRequired,
            spanTreeDepths: PropTypes.object.isRequired,
            startTime: PropTypes.number.isRequired,
            totalDuration: PropTypes.number.isRequired
        };
    }

    render() {
        const {
            timePointers,
            spans,
            startTime,
            totalDuration,
            spanTreeDepths
        } = this.props;
        const timelineHeight = (32 * spans.length) + 37;
        const getSpans = spans.map((span, index) =>
            (<Span
                key={Math.random()}
                index={index}
                startTime={startTime}
                rowHeight={12}
                rowPadding={10}
                span={span}
                totalDuration={totalDuration}
                serviceName={span.serviceName}
                spanDepth={spanTreeDepths[span.spanId]}
            />));
        const lineHeight = timelineHeight - 15;

        return (
            <svg height={timelineHeight} width="100%">
                {timePointers.map(tp =>
                (<g key={Math.random()}>
                    <text x={`${tp.leftOffset}%`} y="25" fill="#6B7693" xmlSpace="preserve" textAnchor="end" >{`${tp.time} `}</text>
                    <rect x={`${tp.leftOffset}%`} y="5" width=".1%" height="100%" fill="#6B7693" fillOpacity="0.3" />
                </g>)
                )}
                <rect x="0%" y="30" width="92%" height="1px" fill="#6B7693" fillOpacity="0.3" />
                <line x1="10.7%" x2="10.5%" y1="58" y2={lineHeight} fill="black" strokeWidth="2" strokeDasharray="3, 7" stroke="black" strokeOpacity="0.3" />
                {getSpans}
            </svg>
        );
    }
}
