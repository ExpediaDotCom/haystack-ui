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

import Span from './span';
import activeTraceStore from '../../../stores/activeTraceStore';

@observer
export default class Timeline extends React.Component {
    static get propTypes() {
        return {
            timelineSpans: PropTypes.object.isRequired,
            timePointers: PropTypes.object.isRequired,
            startTime: PropTypes.number.isRequired,
            totalDuration: PropTypes.number.isRequired
        };
    }

    constructor(props) {
        super(props);
        this.toggleExpand = this.toggleExpand.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    toggleExpand(selectedParentId, expand) {
        activeTraceStore.toggleExpand(selectedParentId, expand);
    }

    render() {
        const {
            timelineSpans,
            timePointers,
            startTime,
            totalDuration
        } = this.props;

        const spans = timelineSpans.filter(s => s.display);

        const timelineHeight = (32 * spans.length) + 37;
        const lineHeight = timelineHeight - 5;
        return (
            <svg height={timelineHeight} width="100%">
                {timePointers.map(tp =>
                (<g key={Math.random()}>
                    <text x={`${tp.leftOffset}%`} y="25" fill="#6B7693" xmlSpace="preserve" textAnchor="end" >{`${tp.time} `}</text>
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
                        span={span}
                        totalDuration={totalDuration}
                        toggleExpand={this.toggleExpand}
                    />)))
              }
            </svg>
        );
    }
}
