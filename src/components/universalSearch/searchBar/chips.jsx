/*
 * Copyright 2017 Expedia, Inc.
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
export default class Chips extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        deleteChip: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            chips: this.props.uiState.chips
        };
    }

    componentWillReceiveProps() {
        this.setState({
            chips: this.props.uiState.chips
        });
    }


    render() {
        const chips = Object.keys(this.props.uiState.chips).map((chip) => {
            let chipName = '';
            if (chip.includes('nested_')) {
                const baseObject = this.props.uiState.chips[chip];
                Object.keys(baseObject).forEach((key) => {
                    chipName += `${key}=${baseObject[key]} `;
                });
                chipName = `(${chipName.trim()})`;
            } else {
                chipName = `${chip}=${this.props.uiState.chips[chip]}`;
            }
            return (
                <div className="usb-chip" key={Math.random()}>
                    <span className="usb-chip__value">{chipName}</span>
                    <button type="button" className="usb-chip__delete" onClick={() => this.props.deleteChip(chip)}>x</button>
                </div>
            );
        });

        return (
            <div className="usb-chips">
                 {chips}
            </div>
        );
    }
}
