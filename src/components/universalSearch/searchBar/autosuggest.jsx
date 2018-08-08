/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {when} from 'mobx';

import TimeWindowPicker from './timeWindowPicker';
import Chips from './chips';
import Guide from './guide';
import Suggestions from './suggestions';
import SearchSubmit from './searchSubmit';

import './autosuggest.less';

const BACKSPACE = 8;
const SPACE = 32;
const TAB = 9;
const ENTER = 13;
const UP = 38;
const DOWN = 40;
const ESC = 27;

@observer
export default class Autocomplete extends React.Component {
    static propTypes = {
        uiState: PropTypes.object.isRequired,
        options: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ]),
        search: PropTypes.func.isRequired,
        serviceStore: PropTypes.object.isRequired,
        operationStore: PropTypes.object.isRequired
    };

    static defaultProps = {
        options: []
    };

    static focusInput(event) {
        const children = event.target.children;

        if (children.length) children[children.length - 1].focus();
    }

    static completeInputString(inputString) {
        if (inputString[0] === '(') {
            return inputString[inputString.length - 1] === ')';
        }
        return /^([a-zA-Z0-9\s-]+)[=]([a-zA-Z0-9,\s-:/_.#$+!%@^&?<>]+)$/g.test(inputString);
    }

    constructor(props) {
        super(props);

        this.state = {
            suggestionStrings: [],
            suggestionIndex: null,
            existingKeys: [],
            inputError: false
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
        this.handlePaste = this.handlePaste.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleSelectionFill = this.handleSelectionFill.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.setInputRef = this.setInputRef.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.updateChips = this.updateChips.bind(this);
        this.modifyChip = this.modifyChip.bind(this);
        this.deleteChip = this.deleteChip.bind(this);
        this.testForValidInputString = this.testForValidInputString.bind(this);
        this.checkServiceAndUpdateOperation = this.checkServiceAndUpdateOperation.bind(this);
    }

    componentDidMount() {
        when(() => this.props.serviceStore.services.length,
            () => {
                this.props.options.serviceName = this.props.serviceStore.services;
                delete this.props.options.operationName;
            });

        const serviceName = this.props.uiState.chips.serviceName;
        if (serviceName) {
            this.props.operationStore.fetchOperations(serviceName, () => {
                this.props.options.operationName = this.props.operationStore.operations;
            });
        }
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    setInputRef(node) {
        this.inputRef = node;
    }

    // Takes current active word and searches suggestion options for keys that are valid.
    setSuggestions(input) {
        const suggestionArray = [];
        const splitInput = input.replace(/\s*=\s*/g, '=').replace('(', '').split(' ');
        const targetInput = splitInput[splitInput.length - 1];

        const equalSplitter = targetInput.indexOf('=');
        let value;
        let type;
        if (equalSplitter > 0) {
            type = 'Values';
            const key = targetInput.substring(0, equalSplitter).trim();
            value = targetInput.substring(equalSplitter + 1, targetInput.length).trim();
            if (this.props.options[key]) {
                this.props.options[key].forEach((option) => {
                    if (option.toLowerCase().includes(value.toLowerCase())) {
                        suggestionArray.push(option);
                    }
                });
            }
        } else {
            type = 'Keys';
            value = targetInput.toLowerCase();
            Object.keys(this.props.options).forEach((option) => {
                if (option.toLowerCase().includes(value)) {
                    suggestionArray.push(option);
                }
            });
        }
        this.setState({
            suggestionStrings: suggestionArray,
            suggestedOnValue: value,
            suggestedOnType: type,
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
            this.updateChips();
        }
        this.props.search();
    }

    // Selection choice fill when navigating with arrow keys
    handleSelectionFill() {
        const splitInput = this.inputRef.value.replace(/\s*=\s*/g, '=').split(' ');
        const targetInput = splitInput[splitInput.length - 1];
        const isNested = targetInput[0] === '(' ? '(' : '';
        const equalSplitter = targetInput.indexOf('=');
        let fillValue = '';
        if (equalSplitter > 0) {
            const key = targetInput.substring(0, equalSplitter);
            const value = this.state.suggestionStrings[this.state.suggestionIndex || 0];
            fillValue = `${key}=${value}`;
        } else {
            fillValue = `${isNested}${this.state.suggestionStrings[this.state.suggestionIndex || 0]}`;
        }
        splitInput[splitInput.length - 1] = fillValue;
        this.inputRef.value = splitInput.join(' ');
    }

    // Selection chose when clicking or pressing space/tab/enter
    handleSelection() {
        this.handleSelectionFill();
        this.handleBlur();
        this.inputRef.focus();
        const splitInput = this.inputRef.value.replace(/\s*=\s*/g, '=').split(' ');
        const targetInput = splitInput[splitInput.length - 1];
        if (targetInput.indexOf('=') < 0) {
            this.inputRef.value = `${this.inputRef.value}=`;
            this.setState({
                suggestionStrings: []
            }, () => {
                this.setSuggestions(this.inputRef.value);
            });
        }
    }

    // updating operations inside a nested query
    checkServiceAndUpdateOperation(input) {
        const inputValue = input.trim().replace(/\s*=\s*/g, '=');

        // if serviceName is there in the same query, trigger request for operations
        if (inputValue.indexOf('(') > -1 && inputValue.includes('serviceName')) {
            const splitInput = inputValue.replace('(', '').split(' ');

            if (splitInput.every(this.testForValidInputString)) { // Valid input tests
                const kvPair = splitInput[splitInput.length - 1];
                const chipKey = kvPair.substring(0, kvPair.indexOf('=')).trim();
                const chipValue = kvPair.substring(kvPair.indexOf('=') + 1, kvPair.length).trim();
                if (chipKey.includes('serviceName')) {
                    this.props.options.operationName = null;
                    this.props.operationStore.fetchOperations(chipValue, () => {
                        this.props.options.operationName = this.props.operationStore.operations;
                    });
                }
            }
        }
    }

    // Logic for when the user pastes into search bar
    handlePaste(e) {
        e.preventDefault();
        const splitPastedText = e.clipboardData.getData('Text').split('');
        splitPastedText.forEach((char) => {
            this.inputRef.value += char;
            if (char === ' ') this.handleKeyPress({keyCode: SPACE, preventDefault: () => {}});
        });
        if (Autocomplete.completeInputString(this.inputRef.value)) this.updateChips();
    }

    // Logic for navigation and selection with keyboard presses
    handleKeyPress(e) {
        const keyPressed = e.keyCode || e.which;
        if ((keyPressed === ENTER || keyPressed === TAB) && this.state.suggestionStrings.length) {
            e.preventDefault();
            this.handleSelection();
            this.handleBlur();
        } else if (keyPressed === ENTER) {
            e.preventDefault();
            this.updateChips();
            this.props.search();
        } else if (keyPressed === TAB && this.inputRef.value) {
            e.preventDefault();
            this.updateChips();
        } else if (keyPressed === SPACE) {
            if (Autocomplete.completeInputString(this.inputRef.value.trim())) {
                e.preventDefault();
                this.updateChips();
            } else {
                this.checkServiceAndUpdateOperation(this.inputRef.value);
            }
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
            const chips = Object.keys(this.props.uiState.chips);
            if (!this.inputRef.value && chips.length) {
                e.preventDefault();
                this.modifyChip(chips[chips.length - 1]);
            }
        }
    }

    modifyChip(chipKey) {
        const chipValue = this.props.uiState.chips[chipKey];
        if (typeof chipValue === 'object') { // Check for nested KV pairs
            let fullString = '';
            const nestedKeys = Object.keys(chipValue);
            nestedKeys.forEach((key) => {
                if (key === nestedKeys[nestedKeys.length - 1]) {
                    fullString += `${key}=${chipValue[key]}`;
                } else {
                    fullString += `${key}=${chipValue[key]} `;
                }
            });
            this.inputRef.value = `(${fullString.trim()})`;
        } else {
            this.inputRef.value = `${chipKey}=${chipValue}`;
        }
        this.deleteChip(chipKey);
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

    // Test for correct formatting on K/V pairs
    testForValidInputString(kvPair) {
        if (/^(.+)[=](.+)$/g.test(kvPair)) { // Ensure format is a=b
            const valueKey = kvPair.substring(0, kvPair.indexOf('=')).trim();
            if (Object.keys(this.props.options).includes(valueKey)) { // Ensure key is searchable
                this.setState(prevState => ({existingKeys: [...prevState.existingKeys, valueKey]}));
                return true;
            }
            this.setState({
                inputError: 'Indicated key is not whitelisted. Please submit a valid key'
            });
            return false;
        }
        this.setState({
            inputError: 'Invalid K/V Pair, please use format "abc=xyz" or "(abc=def ghi=jkl)"'
        });
        return false;
    }

    // Adds inputted text chip to client side store
    updateChips() {
        this.handleBlur();
        const inputValue = this.inputRef.value.trim().replace(/\s*=\s*/g, '=');
        if (!inputValue) return;
        let formattedValue = null;
        if (inputValue.indexOf('(') > -1) {
            if (!/^\(.*\)$/g.test(inputValue)) { // If multiple items, test that they are enclosed in parenthesis
                this.setState({
                    inputError: 'Invalid K/V grouping, make sure parentheses are closed'
                });
                return;
            }
            formattedValue = inputValue.substring(1, inputValue.length - 1).trim();
        } else {
            formattedValue = inputValue;
        }
        const splitInput = formattedValue.split(' ');
        if (splitInput.every(this.testForValidInputString)) { // Valid input tests
            let chipKey = null;
            let chipValue = null;

            if (splitInput.length > 1) {
                const chipIndex = Object.keys(this.props.uiState.chips).length; // Create nested object of KV pairs
                chipKey = `nested_${chipIndex}`;
                chipValue = {};
                splitInput.forEach((kvPair) => {
                    const trimmedPair = kvPair.trim();
                    const key = trimmedPair.substring(0, kvPair.indexOf('='));
                    chipValue[key] = trimmedPair.substring(kvPair.indexOf('=') + 1, kvPair.length);
                });
            } else {
                const kvPair = splitInput[0];
                chipKey = kvPair.substring(0, kvPair.indexOf('=')).trim();
                chipValue = kvPair.substring(kvPair.indexOf('=') + 1, kvPair.length).trim();
            }
            this.props.uiState.chips[chipKey] = chipValue;
            if (chipKey.includes('serviceName')) {
                this.props.options.operationName = null;
                this.props.operationStore.fetchOperations(chipValue, () => {
                    this.props.options.operationName = this.props.operationStore.operations;
                });
            }
            this.setState({inputError: false});
            this.inputRef.value = '';
        }
    }

    deleteChip(chipKey) {
        const chipValue = this.props.uiState.chips[chipKey];
        if (chipValue !== undefined) {
            const keysToSplice = chipKey.includes('nested_') ? Object.keys(chipKey) : [chipKey];
            const updatedExistingKeys = this.state.existingKeys;

            keysToSplice.forEach((key) => {
                if (key === 'serviceName') {
                    this.setState({
                        serviceName: null
                    });
                    delete this.props.options.operationName;
                }
                const itemIndex = updatedExistingKeys.indexOf(key);
                updatedExistingKeys.splice(itemIndex, 1);
            });

            this.setState({existingKeys: updatedExistingKeys});
            delete this.props.uiState.chips[chipKey];
            this.props.search();
        }
    }

    render() {
        const uiState = this.props.uiState;

        const ErrorMessaging = ({inputError}) => (inputError ? <div className="usb-search__error-message">{this.state.inputError}</div> : null);

        return (
            <article className="usb-wrapper">
                <div className="usb-search" role="form" onClick={Autocomplete.focusInput}>
                    <Chips deleteChip={this.deleteChip} uiState={uiState} />
                    <div className="usb-searchbar">
                        <input
                            type="text"
                            className="usb-searchbar__input"
                            onPaste={this.handlePaste}
                            onKeyDown={this.handleKeyPress}
                            onChange={this.updateFieldKv}
                            ref={this.setInputRef}
                            onFocus={this.handleFocus}
                            placeholder={uiState.chips.length ? '' : 'Search tags and services...'}
                        />
                    </div>
                    <TimeWindowPicker uiState={uiState} />
                    <SearchSubmit handleSearch={this.handleSearch} />
                </div>
                <div className="usb-suggestions">
                    <div ref={this.setWrapperRef} className={this.state.suggestionStrings.length ? 'usb-suggestions__tray clearfix' : 'hidden'}>
                        <Suggestions
                            handleHover={this.handleHover}
                            handleSelection={this.handleSelection}
                            suggestionIndex={this.state.suggestionIndex}
                            suggestionStrings={this.state.suggestionStrings}
                            suggestedOnType={this.state.suggestedOnType}
                            suggestedOnValue={this.state.suggestedOnValue}
                        />
                        <Guide/>
                    </div>
                </div>
                <ErrorMessaging inputError={this.state.inputError}/>
            </article>
        );
    }
}
