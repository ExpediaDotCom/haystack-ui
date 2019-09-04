/*
 * Copyright 2018 Expedia Group
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

import React from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

@observer
export default class QueryBank extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        deleteChip: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    render() {
        const queries = this.props.uiState.queries.map((query, index) => {
            return (
                <div className={`usb-chip query-${index + 1}`} key={Math.random()}>
                    {
                        query.map(nestedChip => (
                            <span key={Math.random()}>
                                <span className="usb-chip__key">{nestedChip.key}</span>
                                {nestedChip.operator !== '=' ? <span className="usb-chip__operator">{nestedChip.operator}</span> : null}
                                <span className="usb-chip__value">{nestedChip.value}</span>
                                </span>
                        ))
                    }
                    <button type="button" className="usb-chip__delete" onClick={() => this.props.deleteChip(index)}>x</button>
                </div>
            );
        });

        return (
            <div className="usb-queries">
                {queries}
            </div>
        );
    }
}
