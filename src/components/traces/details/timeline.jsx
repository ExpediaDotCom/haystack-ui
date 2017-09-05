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

import React from 'react';
import PropTypes from 'prop-types';
import Span from './span';

export default class Timeline extends React.Component {

    static get propTypes() {
        return {
            timePointers: PropTypes.array.isRequired,
            spans: PropTypes.array.isRequired,
            startTime: PropTypes.number.isRequired,
            totalDuration: PropTypes.number.isRequired
        };
    }
    static getServiceName(span) {
        const fromAnnotations = (span.annotations)
            .find(anno =>
            (anno.value !== null)
            && (anno.endpoint !== null)
            && (anno.endpoint.serviceName !== null)
            && (anno.endpoint.serviceName !== ''));
        const serviceFromAnnotations = fromAnnotations ? fromAnnotations.endpoint.serviceName : 'not found';
        if (serviceFromAnnotations) {
            return serviceFromAnnotations;
        }
        return null;
    }
    render() {
        const {
            timePointers,
            spans,
            startTime,
            totalDuration
        } = this.props;
        const timelineHeight = (32 * spans.length) + 30;
        const getSpans = spans.map((span, index) =>
            (<Span
                key={span.id}
                index={index}
                startTime={startTime}
                rowHeight={12}
                rowPadding={10}
                span={span}
                totalDuration={totalDuration}
                serviceName={Timeline.getServiceName(span)}
            />));

        return (
            <svg height={timelineHeight} width="100%">
                <g>
                    {timePointers.map(tp => <text x={`${tp.leftOffset}%`} y="25" fill="#6B7693">{tp.time}</text>)}
                </g>
                {getSpans}
            </svg>
        );
    }
}
