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
import {Link} from 'react-router-dom';

import ModalView from '../common/modal';


export default class TraceDetailsRow extends React.Component {

    static get propTypes() {
        return {
            index: PropTypes.number.isRequired,
            startTime: PropTypes.number.isRequired,
            rowHeight: PropTypes.number.isRequired,
            rowPadding: PropTypes.number.isRequired,
            span: PropTypes.object.isRequired,
            totalDuration: PropTypes.number.isRequired,
            serviceName: PropTypes.string.isRequired
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
            serviceName
        } = this.props;
        const topOffset = (index * (rowHeight + (rowPadding * 2))) + (rowPadding * 2);
        const spanTimestamp = span.timestamp;
        const spanDuration = span.duration;
        const leftOffset = (((((spanTimestamp - startTime) / totalDuration) * 100) * 0.7) + 12);
        const width = ((spanDuration / totalDuration) * 100) * 0.7;
        const formattedDuration = `${span.duration / 1000}ms`;
        return (
            <g className="">
                <text
                    className="service-svg-text"
                    fill="#6B7693"
                    x="1%"
                    y={topOffset}
                >{serviceName}
                </text>
                <text
                    className="trace-svg-text"
                    fill="#6B7693"
                    x={leftOffset > 50 ? `${leftOffset + width}%` : `${leftOffset}%`}
                    y={topOffset}
                    textAnchor={leftOffset > 50 ? 'end' : 'start'}
                >{span.name}:{formattedDuration}
                </text>
                <rect
                    className="btn trace-svg-bar"
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
                    width="80%"
                    x="0"
                    y={topOffset - 13}
                    height={rowHeight + 20}
                    onClick={this.openModal}
                />
                <ModalView isOpen={this.state.modalIsOpen} closeModal={this.closeModal} title={`Span Id# ${span.id}`}>
                    <p>{span.duration / 1000}ms</p>
                    <Link className="btn btn-primary modal-button-margin" to={`/service/${serviceName}/trends`}>View in Trends</Link>
                    <Link className="btn trace-btn-right modal-button-margin" to={`/service/${serviceName}/flow`}>Dependencies</Link>
                    <pre>
                        <table>
                            <tr>
                                <th className="modal-table-padding">Key</th>
                                <th className="modal-table-padding">Value</th>
                            </tr>
                            {span.binaryAnnotations.map(annotation =>
                                (<tr>
                                    <td className="modal-table-padding">{annotation.key}</td>
                                    <td className="modal-table-padding">{annotation.value}</td>
                                </tr>)
                            )}
                        </table>
                    </pre>
                </ModalView>
            </g>
        );
    }
}
