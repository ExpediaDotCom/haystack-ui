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
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';


@observer
export default class Autocomplete extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        options: PropTypes.array
    };

    static defaultProps = {
        options: []
    };

    constructor(props) {
        super(props);

        this.state = {
            fieldsString: [],
            suggestionIndex: null,
            existingKeys: []
        };

        this.updateFieldKv = this.updateFieldKv.bind(this);
        this.setSuggestions = this.setSuggestions.bind(this);
        this.lowerSuggestion = this.lowerSuggestion.bind(this);
        this.higherSuggestion = this.higherSuggestion.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleSelectionFill = this.handleSelectionFill.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.addExistingKeys = this.addExistingKeys.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    // Takes current active word and searches suggestion options for keys that are valid.
    setSuggestions(inputValue) {
        this.addExistingKeys();
        const splitInputValue = inputValue.split(' ');
        const activeValue = splitInputValue.slice(-1)[0];
        const arr = [];
        this.props.options.forEach((option) => {
            if (option.toLowerCase().includes(activeValue.toLowerCase()) && !this.state.existingKeys.includes(option)) {
                arr.push(option);
            }
        });
        this.setState({
            fieldsString: arr,
            suggestionIndex: null
        });
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    // Splits current input value into individual strings to grab keys to eliminate from suggestion pool
    addExistingKeys() {
        const items = [];
        const inputKeys = this.props.uiState.fieldsKvString.split(' ');
        inputKeys.forEach((item) => {
            if (item.includes('=')) {
                items.push(item.substring(0, item.indexOf('=')));
            }
        });
        this.setState({existingKeys: items});
    }

    // Moves highlighted suggestion down one option (toward bottom of screen)
    lowerSuggestion() {
        if (this.state.fieldsString.length) {
            let stateUpdate = null;
            if (this.state.suggestionIndex !== null && this.state.suggestionIndex < this.state.fieldsString.length - 1) {
                stateUpdate = this.state.suggestionIndex + 1;
            } else {
                stateUpdate = 0;
            }
            this.setState({suggestionIndex: stateUpdate}, () => {
                this.handleSelectionFill();
            });
        }
    }

    // Moves highlighted suggestion up one option (toward top of screen)
    higherSuggestion() {
        if (this.state.fieldsString.length) {
            let stateUpdate = null;
            if (this.state.suggestionIndex !== null && this.state.suggestionIndex > 0) {
                stateUpdate = this.state.suggestionIndex - 1;
            } else {
                stateUpdate = this.state.fieldsString.length - 1;
            }
            this.setState({suggestionIndex: stateUpdate}, () => {
                this.handleSelectionFill();
            });
        }
    }

    // Updates input field and uiState props value
    updateFieldKv(event) {
        this.props.uiState.setFieldsUsingKvString(event.target.value);
        this.setSuggestions(event.target.value);
        if (this.state.suggestionIndex) {
            this.setState({
                suggestionIndex: 0
            });
        }
    }

    // Hides suggestion list by emptying stateful array
    handleBlur() {
        this.setState({
            fieldsString: []
        });
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    handleFocus(e) {
        if (!this.state.fieldsString.length) {
            this.setSuggestions(e.target.value);
        }
    }

    // Changes active suggestion which will cause a rerender for hovered object
    handleHover(index) {
        this.setState({
            suggestionIndex: index
        });
    }

    // Hides array when any node that isn't the suggestion list is clicked
    handleOutsideClick(e) {
        if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
            document.removeEventListener('mousedown', this.handleOutsideClick);
            this.setState({fieldsString: []});
        }
    }

    // Selection choice fill when navigating with arrow keys
    handleSelectionFill() {
        const splitString = this.props.uiState.fieldsKvString.split(' ');
        splitString[splitString.length - 1] = `${this.state.fieldsString[this.state.suggestionIndex || 0]}`;
        this.props.uiState.fieldsKvString = splitString.join(' ');
    }

    // Selection chose when clicking or pressing enter
    handleSelection() {
    if (this.state.fieldsString.length) {
        this.handleSelectionFill();
        this.props.uiState.fieldsKvString = `${this.props.uiState.fieldsKvString}=`;
        this.handleBlur();
        this.autosuggestInput.focus();
        }
    }

    // Logic for navigation and selection with keyboard presses
    handleKeyPress(e) {
        if ((e.keyCode === 13 && this.state.fieldsString.length) || e.keyCode === 9) {
            e.preventDefault();
            this.handleSelection();
            this.handleBlur();
        } else if (e.keyCode === 38) {
            e.preventDefault();
            this.higherSuggestion();
        } else if (e.keyCode === 40) {
            e.preventDefault();
            this.lowerSuggestion();
        } else if (e.keyCode === 27) {
            e.preventDefault();
            this.handleBlur();
        } else {
            this.updateFieldKv(e);
        }
    }

    render() {
        const sIndex = this.state.suggestionIndex;
        return (
            <div className="autosuggestion-box">
                <input
                    type="text"
                    className="search-bar-text-box"
                    value={this.props.uiState.fieldsKvString}
                    onKeyDown={this.handleKeyPress}
                    onChange={this.updateFieldKv}
                    ref={(input) => { this.autosuggestInput = input; }}
                    onFocus={this.handleFocus}
                />
                <ul ref={this.setWrapperRef} className={this.state.fieldsString.length ? 'autofill-suggestions' : 'hidden'}>
                    {this.state.fieldsString.map((item, i) => (
                            <li
                                key={item}
                                onMouseEnter={() => this.handleHover(i)}
                                onClick={() => this.handleSelection()}
                                className={sIndex === i ? 'autofill-suggestion active-suggestion' : 'autofill-suggestion'}
                            >
                                {item}
                            </li>)
                    )}
                </ul>
            </div>
        );
    }
}
