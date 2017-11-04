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
import {observer} from 'mobx-react';
import formatters from '../../../utils/formatters';

import Span from './span';

@observer
export default class Timeline extends React.Component {
    static propTypes = {
        timelineSpans: PropTypes.array.isRequired,
        startTime: PropTypes.number.isRequired,
        totalDuration: PropTypes.number.isRequired,
        maxDepth: PropTypes.number.isRequired,
        toggleExpand: PropTypes.func.isRequired
    };

    static getTimePointers(totalDuration, timelineWidthPerc) {
        const offsets = [0.0, 0.25, 0.50, 0.75, 1.0];
        const pointerDurations = offsets.map(dur => (totalDuration * dur));
        const leftOffset = offsets.map(lo => (100 - timelineWidthPerc) + (timelineWidthPerc * (lo - 0.001)));

        return leftOffset.map((p, i) => ({leftOffset: p, time: formatters.toDurationString(pointerDurations[i])}));
    }

    constructor(props) {
        super(props);
        this.toggleExpand = this.toggleExpand.bind(this);
    }

    toggleExpand(selectedParentId, expand) {
        this.props.toggleExpand(selectedParentId, expand);
    }

    render() {
        const {
            timelineSpans,
            startTime,
            totalDuration,
            maxDepth
        } = this.props;

        // layout constants
        const spanHeight = 34;
        const timelineWidthPercent = 85;
        const timePointersHeight = 20;

        // display data items
        const spans = timelineSpans.filter(s => s.display);
        const timePointers = Timeline.getTimePointers(totalDuration, timelineWidthPercent);

        // layout derivatives
        const timelineHeight = timePointersHeight + (spanHeight * spans.length);

        return (
            <svg height={timelineHeight} width="100%">
                {timePointers.map(tp =>
                    (<g key={tp.leftOffset}>
                        <text className="time-pointer" x={`${tp.leftOffset - 0.2}%`} y="15" xmlSpace="preserve" textAnchor="end" >{`${tp.time}`} </text>
                        <line className="time-pointer-line" x1={`${tp.leftOffset}%`} x2={`${tp.leftOffset}%`} y1="0" y2="20" />
                    </g>)
                )}
                <line className="time-pointer-line" x1="0%" x2="100%" y1={timePointersHeight} y2={timePointersHeight} />

                {spans.map((span, index) => {
                    const parent = spans.find(s => s.spanId === span.parentSpanId);
                    const parentStartTimePercent = parent ? parent.startTimePercent : 0;
                    const parentIndex = parent ? spans.indexOf(parent) : 0;

                    return (<Span
                        key={span.spanId}
                        index={index}
                        span={span}
                        startTime={startTime}
                        totalDuration={totalDuration}
                        maxDepth={maxDepth}
                        timelineWidthPercent={timelineWidthPercent}
                        timePointersHeight={timePointersHeight}
                        spanHeight={spanHeight}
                        toggleExpand={this.toggleExpand}
                        parentStartTimePercent={parentStartTimePercent}
                        parentIndex={parentIndex}
                    />);
                    })
                }
            </svg>
        );
    }
}
