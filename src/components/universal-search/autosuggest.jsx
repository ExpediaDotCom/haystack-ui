/*
 * Copyright 2018 Expedia, Inc.
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
import {autorun} from 'mobx';

import TimeWindowPicker from './timeWindowPicker';

import './autosuggest.less';

const BACKSPACE = 8;
const SPACE = 32;
const TAB = 9;
const ENTER = 13;
const UP = 38;
const DOWN = 40;
const ESC = 27;

const INVALID_CHARS = /[^a-zA-Z0-9=\s-[\].]/g;

@observer
export default class Autocomplete extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        options: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ]),
        maxlength: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        search: PropTypes.func.isRequired,
        serviceStore: PropTypes.object.isRequired,
        operationStore: PropTypes.object.isRequired
    };

    static defaultProps = {
        options: [],
        max: 100,
        placeholder: 'Add a chip...',
        maxlength: 50
    };

    static focusInput(event) {
        const children = event.target.children;

        if (children.length) children[children.length - 1].focus();
    }

    constructor(props) {
        super(props);

        this.state = {
            suggestionStrings: [],
            suggestionIndex: null,
            existingKeys: [],
            inputError: false,
            serviceName: null
        };

        if (!this.props.uiState.timeWindow) {
            this.props.uiState.setTimeWindow({
                endTime: undefined,
                startTime: undefined,
                timePreset: '1h'
            });
        }

        this.updateFieldKv = this.updateFieldKv.bind(this);
        this.setSuggestions = this.setSuggestions.bind(this);
        this.lowerSuggestion = this.lowerSuggestion.bind(this);
        this.higherSuggestion = this.higherSuggestion.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleSelectionFill = this.handleSelectionFill.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.setInputRef = this.setInputRef.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.clearInvalidChars = this.clearInvalidChars.bind(this);
        this.updateChips = this.updateChips.bind(this);
        this.modifyChip = this.modifyChip.bind(this);
        this.deleteChip = this.deleteChip.bind(this);
        this.testForValidInputString = this.testForValidInputString.bind(this);
    }

    componentDidMount() {
        autorun(() => {
            if (this.props.serviceStore.services) {
                this.props.options.serviceName = this.props.serviceStore.services;
            }
            if (this.props.operationStore.operations) {
                this.props.options.operationName = this.props.operationStore.operations;
            }
        });
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    setInputRef(node) {
        this.inputRef = node;
    }

    // Takes current active word and searches suggestion options for keys that are valid.
    setSuggestions(inputValue) {
        const arr = [];
        const equalSplitter = inputValue.indexOf('=');
        if (equalSplitter > 0) {
            const key = inputValue.substring(0, equalSplitter);
            const value = inputValue.substring(equalSplitter + 1, inputValue.length);
            if (this.props.options[key]) {
                this.props.options[key].forEach((option) => {
                    if (option.toLowerCase().includes(value.toLowerCase())) {
                        arr.push(option);
                    }
                });
            }
        } else {
            Object.keys(this.props.options).forEach((option) => {
                if (option.toLowerCase().includes(inputValue.toLowerCase()) && !this.state.existingKeys.includes(option)) {
                    arr.push(option);
                }
            });
        }
        this.setState({
            suggestionStrings: arr.sort(),
            suggestionIndex: null
        });
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    // Hides suggestion list by emptying stateful array
    handleBlur() {
        this.setState({
            suggestionStrings: []
        });
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    // Triggered upon clicking input box
    handleFocus(e) {
        if (!this.state.suggestionStrings.length) {
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
            this.setState({suggestionStrings: []});
        }
    }

    // Trigger from pressing the search button
    handleSearch() {
        if (this.inputRef.value) {
            this.updateChips(() => {
                this.props.search();
            });
        }
        this.props.search();
    }

    // Selection choice fill when navigating with arrow keys
    handleSelectionFill() {
        const equalSplitter = this.inputRef.value.indexOf('=');
        if (equalSplitter > -1) {
            const key = this.inputRef.value.substring(0, equalSplitter);
            const value = this.state.suggestionStrings[this.state.suggestionIndex || 0];
            this.inputRef.value = `${key}=${value}`;
        } else {
            this.inputRef.value = `${this.state.suggestionStrings[this.state.suggestionIndex || 0]}`;
        }
    }

    // Selection chose when clicking or pressing space/tab/enter
    handleSelection() {
        this.handleSelectionFill();
        this.handleBlur();
        this.inputRef.focus();
        if (this.inputRef.value.indexOf('=') < 0) {
            this.inputRef.value = `${this.inputRef.value}=`;
            this.setState({
                suggestionStrings: []
            }, () => {
                this.setSuggestions(this.inputRef.value);
            });
        }
    }

    // Logic for navigation and selection with keyboard presses
    handleKeyPress(e) {
        const keyPressed = e.keyCode || e.which;
        if ((keyPressed === ENTER || keyPressed === TAB) && this.state.suggestionStrings.length) {
            e.preventDefault();
            this.handleSelection();
            this.handleBlur();
        } else if (keyPressed === ENTER || ((keyPressed === TAB || keyPressed === SPACE) && e.target.value)) {
            e.preventDefault();
            this.updateChips();
        } else if (keyPressed === UP) {
            e.preventDefault();
            this.higherSuggestion();
        } else if (keyPressed === DOWN) {
            e.preventDefault();
            this.lowerSuggestion();
        } else if (keyPressed === ESC) {
            e.preventDefault();
            this.handleBlur();
        } else if (keyPressed === BACKSPACE) {
            const chips = this.props.uiState.chips;
            if (!this.inputRef.value && chips.length) {
                e.preventDefault();
                this.modifyChip(chips.length - 1);
            }
        }
    }

    modifyChip(index) {
        this.inputRef.value = this.props.uiState.chips[index];
        this.deleteChip(index);
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


    // Moves highlighted suggestion down one option (toward bottom of screen)
    lowerSuggestion() {
        if (this.state.suggestionStrings.length) {
            let stateUpdate = null;
            if (this.state.suggestionIndex !== null && this.state.suggestionIndex < this.state.suggestionStrings.length - 1) {
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
        if (this.state.suggestionStrings.length) {
            let stateUpdate = null;
            if (this.state.suggestionIndex !== null && this.state.suggestionIndex > 0) {
                stateUpdate = this.state.suggestionIndex - 1;
            } else {
                stateUpdate = this.state.suggestionStrings.length - 1;
            }
            this.setState({suggestionIndex: stateUpdate}, () => {
                this.handleSelectionFill();
            });
        }
    }

    clearInvalidChars() {
        const value = this.inputRef.value;

        if (INVALID_CHARS.test(value)) {
            this.inputRef.value = value.replace(INVALID_CHARS, '');
        } else if (value.length > this.props.maxlength) {
            this.inputRef.value = value.substr(0, this.props.maxlength);
        }
    }

    testForValidInputString(value) {
        if (/^([a-zA-Z0-9\s-]+)[=]([a-zA-Z0-9\s-]+)$/g.test(value)) {
            const valueKey = value.substring(0, value.indexOf('='));
            if (Object.keys(this.props.options).includes(valueKey)) {
                if (!this.state.existingKeys.includes(valueKey)) {
                    this.setState(prevState => ({existingKeys: [...prevState.existingKeys, valueKey]}));
                    return true;
                }
                this.setState({
                    inputError: 'Key already exists'
                });
                return false;
            }
            this.setState({
                inputError: 'Indicated key is not whitelisted. Please submit a valid key'
            });
            return false;
        }
        this.setState({
            inputError: 'Invalid K/V Pair, please use format "abc=xyz"'
        });
        return false;
    }

    updateChips() {
        this.handleBlur();
        const value = this.inputRef.value;
        if (!value) return;
        if (true) {
            const chip = value.trim();
            let serviceName = null;
            if (chip.includes('serviceName')) {
                const equalSplitter = this.inputRef.value.indexOf('=');
                serviceName = chip.substring(equalSplitter + 1, this.inputRef.value.length);
                this.props.operationStore.fetchOperations(serviceName);
            }

            if (chip && this.props.uiState.chips.indexOf(chip) < 0) {
                this.setState({inputError: false, serviceName});
                this.props.uiState.chips.push(chip);
                this.inputRef.value = '';
                this.props.search();
            }
        }
    }

    deleteChip(chipIndex) {
        if (chipIndex >= 0) {
            const updatedChips = this.props.uiState.chips;
            const item = updatedChips[chipIndex];
            if (item.includes('serviceName')) {
                this.setState({
                    serviceName: null
                });
            }
            const updatedExistingKeys = this.state.existingKeys;
            const itemIndex = updatedExistingKeys.indexOf(item);

            updatedExistingKeys.splice(itemIndex, 1);
            updatedChips.splice(chipIndex, 1);

            this.setState({existingKeys: updatedExistingKeys});
            this.props.search();
        }
    }

    render() {
        const chips = this.props.uiState.chips.map((chip, index) => (
            <span className="chip" key={Math.random()}>
                <span className="chip-value">{chip}</span>
                <button type="button" className="chip-delete-button" onClick={() => this.deleteChip(index)}>x</button>
            </span>
        ));

        const sIndex = this.state.suggestionIndex;

        return (
            <article className="universal-search-bar search-query-bar">
                <div className="search-bar-pickers">
                    <div className="search-bar-pickers_fields">
                        <div className="autosuggestion-box chips" role="form" onClick={Autocomplete.focusInput}>
                            <div className="chips-and-input">
                                {chips}
                                <input
                                    type="text"
                                    className="search-bar-text-box autosuggest-input"
                                    onKeyDown={this.handleKeyPress}
                                    onKeyUp={this.clearInvalidChars}
                                    onChange={this.updateFieldKv}
                                    ref={this.setInputRef}
                                    onFocus={this.handleFocus}
                                    placeholder={this.props.uiState.chips.length ? '' : 'Select a whitelisted key'}
                                />
                                <ul ref={this.setWrapperRef} className={this.state.suggestionStrings.length ? 'autofill-suggestions' : 'hidden'}>
                                    {this.state.suggestionStrings.map((item, i) => (
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
                            <TimeWindowPicker uiState={this.props.uiState} />
                            <button
                                type="submit"
                                className="btn btn-primary usb-search-button"
                                onClick={this.handleSearch}
                            >
                                <span className="ti-search"/>
                            </button>
                            {this.state.inputError ? <div style={{color: 'red', fontWeight: 'bold'}}>{this.state.inputError}</div> : null}
                        </div>
                    </div>
                </div>
            </article>
        );
    }
}
