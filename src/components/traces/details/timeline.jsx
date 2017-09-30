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
        toggleExpand: PropTypes.func.isRequired
    };

    static getTimePointers(totalDuration) {
        const pointerDurations = [0.0, 0.25, 0.50, 0.75, 1.0]
            .map(dur => (totalDuration * dur));
        const leftOffset = [0.12, 0.32, 0.52, 0.72, 0.92]
            .map(lo => (lo * 100));

        return leftOffset.map((p, i) => ({leftOffset: p, time: formatters.toDurationString(pointerDurations[i])}));
    }

    constructor(props) {
        super(props);
        this.toggleExpand = this.toggleExpand.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    toggleExpand(selectedParentId, expand) {
        this.props.toggleExpand(selectedParentId, expand);
    }

    render() {
        const {
            timelineSpans,
            startTime,
            totalDuration
        } = this.props;

        const timePointers = Timeline.getTimePointers(totalDuration);
        const spans = timelineSpans.filter(s => s.display);
        const timelineWidthPerc = 80;
        const timelineBottomPadding = 37;
        const timelineHeight = (32 * spans.length) + timelineBottomPadding;
        const timePointersHeight = 30;
        const lineHeight = timelineHeight - 15;
        return (
            <svg height={timelineHeight} width="100%">
                {timePointers.map(tp =>
                (<g key={Math.random()}>
                    <text className="time-pointer" x={`${tp.leftOffset - 0.2}%`} y="25" fill="#6B7693" xmlSpace="preserve" textAnchor="end" >{`${tp.time}`}</text>
                    <rect x={`${tp.leftOffset}%`} y="5" width=".1%" height="100%" fill="#6B7693" fillOpacity="0.3" />
                </g>)
                )}
                <rect x="0%" y="30" width="92%" height="1px" fill="#6B7693" fillOpacity="0.3" />
                <line x1="11%" x2="11%" y1="58" y2={lineHeight} fill="black" strokeWidth="2" strokeDasharray="3, 7" stroke="black" strokeOpacity="0.3" />

              {
                spans.map((span, index) => (
                    (<Span
                        key={span.spanId}
                        index={index}
                        startTime={startTime}
                        rowHeight={12}
                        rowPadding={10}
                        timelineWidthPerc={timelineWidthPerc}
                        timePointersHeight={timePointersHeight}
                        span={span}
                        totalDuration={totalDuration}
                        toggleExpand={this.toggleExpand}
                    />)))
              }
            </svg>
        );
    }
}
