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

const subsystems = (window.haystackUiConfig && window.haystackUiConfig.subsystems) || [];
const tracesEnabled = subsystems.includes('traces');

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
        options: PropTypes.object,
        search: PropTypes.func.isRequired,
        serviceStore: PropTypes.object.isRequired,
        operationStore: PropTypes.object.isRequired
    };

    static defaultProps = {
        options: {}
    };

    static focusInput(event) {
        const children = event.target.children;

        if (children.length) children[children.length - 1].focus();
    }

    static checkForWhitespacedValue(value) {
        return value.indexOf(' ') < 0 ? value : `"${value}"`;
    }

    static completeInputString(inputString) {
        if (inputString[0] === '(') {
            return inputString[inputString.length - 1] === ')';
        } else if (inputString.includes('"')) {
            return ((inputString.match(/"/g) || []).length === 2);
        }
        return /^([a-zA-Z0-9\s-]+)([=><])([a-zA-Z0-9,\s-:/_".#$+!%@^&?<>]+)$/g.test(inputString);
    }

    static findIndexOfoperator(inputString) {
        const match = inputString.match(/([=><])/);
        return match && match.index;
    }

    static removeWhiteSpaceAroundInput(inputString) {
        const operatorIndex = Autocomplete.findIndexOfoperator(inputString);
        if (operatorIndex) {
            const operator = inputString[operatorIndex];
            return inputString.split(operator).map(piece => piece.trim()).join(operator);
        }
        return inputString.trim();
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
        this.inputMatchesRangeKey = this.inputMatchesRangeKey.bind(this);
        this.setSuggestions = this.setSuggestions.bind(this);
        this.lowerSuggestion = this.lowerSuggestion.bind(this);
        this.higherSuggestion = this.higherSuggestion.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleDropdownSelection = this.handleDropdownSelection.bind(this);
        this.fillInputFromDropdownSelection = this.fillInputFromDropdownSelection.bind(this);
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
        this.checkSplitInputForValuesWithWhitespace = this.checkSplitInputForValuesWithWhitespace.bind(this);
    }

    componentDidMount() {
        // First-class citizens for searching
        this.props.options.serviceName = {isRangeQuery: false, values: this.props.serviceStore.services};
        this.props.options.operationName = {isRangeQuery: false, values: []};
        this.props.options.traceId = {isRangeQuery: false, values: []};

        // Populates serviceName list after async request is finished
        when(() => this.props.serviceStore.services.length > 0,
            () => {
                this.props.options.serviceName.values = this.props.serviceStore.services;
                this.props.options.operationName.values = [];
            });

        // Checks for operations when a user supplies a new serviceName
        const serviceName = this.props.uiState.chips.serviceName;
        if (serviceName && tracesEnabled) {
            this.props.operationStore.fetchOperations(serviceName, () => {
                this.props.options.operationName.values = this.props.operationStore.operations;
            });
        }
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    setInputRef(node) {
        this.inputRef = node;
    }

    // Takes current input value and displays suggestion options.
    setSuggestions(input) {
        let suggestionArray = [];
        const rawSplitInput = Autocomplete.removeWhiteSpaceAroundInput(input).replace('(', '').split(' ');
        const splitInput = this.checkSplitInputForValuesWithWhitespace(rawSplitInput);
        const targetInput = splitInput[splitInput.length - 1];
        const operatorIndex = Autocomplete.findIndexOfoperator(targetInput);

        let value;
        let type;
        if (operatorIndex) {
            type = 'Values';
            const key = targetInput.substring(0, operatorIndex).trim();
            value = targetInput.substring(operatorIndex + 1, targetInput.length).trim().replace('"', '');
            if (this.props.options[key] && this.props.options[key].values) {
                this.props.options[key].values.forEach((option) => {
                    if (option.toLowerCase().includes(value.toLowerCase())) {
                        suggestionArray.push(option);
                    }
                });
            }
        } else if (this.inputMatchesRangeKey(targetInput)) {
            type = 'operator';
            suggestionArray = ['>', '=', '<'];
            value = '';
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

    inputMatchesRangeKey(input) {
        let match = false;
        Object.keys(this.props.options).forEach((option) => {
            if (input === option && this.props.options[option].isRangeQuery === true) match = true;
        });
        return match;
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

    // Changes active suggestion which will cause a re-render for hovered object
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

    // Trigger from pressing the search button or enter on an empty input field
    handleSearch() {
        if (this.inputRef.value) {
            this.updateChips();
        }
        this.props.search();
    }

    // Selection choice fill when navigating with arrow keys
    fillInputFromDropdownSelection() {
        const rawSplitInput = Autocomplete.removeWhiteSpaceAroundInput(this.inputRef.value).split(' ');
        const splitInput = this.checkSplitInputForValuesWithWhitespace(rawSplitInput);
        const targetInput = splitInput[splitInput.length - 1];
        const isNested = targetInput[0] === '(' ? '(' : '';
        const operatorIndex = Autocomplete.findIndexOfoperator(targetInput);
        let fillValue = '';
        let value = this.state.suggestionStrings[this.state.suggestionIndex || 0];
        value = Autocomplete.checkForWhitespacedValue(value);
        if (this.state.suggestedOnType === 'operator') {
            const slicedInput = targetInput.replace(/[(>=<)]/, '');
            fillValue = `${slicedInput}${value}`;
        } else if (operatorIndex) {
            const operator = targetInput[operatorIndex];
            const key = targetInput.substring(0, operatorIndex);
            fillValue = `${key}${operator}${value}`;
        } else {
            fillValue = `${isNested}${value}`;
        }
        splitInput[splitInput.length - 1] = fillValue;
        this.inputRef.value = splitInput.join(' ');
    }

    // Selection chose when clicking or pressing space/tab/enter
    handleDropdownSelection() {
        this.fillInputFromDropdownSelection();
        this.handleBlur();
        this.inputRef.focus();
        if (!Autocomplete.findIndexOfoperator(this.inputRef.value)) {
            if (!this.inputMatchesRangeKey(this.inputRef.value)) this.inputRef.value = `${this.inputRef.value}=`;
            this.setState({
                suggestionStrings: []
            }, () => {
                this.setSuggestions(this.inputRef.value);
            });
        }
    }

    // Recursively checks split input for values that might be enclosed in quotations
    checkSplitInputForValuesWithWhitespace(splitInput) {
        let splitInputArrayToBeChecked = splitInput;
        splitInputArrayToBeChecked.forEach((potentialKV, index) => {
            if ((potentialKV.match(/"/g) || []).length === 1) {
                const nextItem = splitInput[index + 1] === '' ? ' ' : splitInput[index + 1];
                if (nextItem) {
                    splitInputArrayToBeChecked[index] = [potentialKV, nextItem].join(' ');
                    splitInputArrayToBeChecked.splice(index + 1, 1);
                    splitInputArrayToBeChecked = this.checkSplitInputForValuesWithWhitespace(splitInputArrayToBeChecked);
                }
            }
        });
        return splitInputArrayToBeChecked;
    }

    // Updating operations inside a nested query
    checkServiceAndUpdateOperation(input) {
        const inputValue = Autocomplete.removeWhiteSpaceAroundInput(input);

        // If serviceName in the same query, trigger request for operations
        if (inputValue.indexOf('(') > -1 && inputValue.includes('serviceName')) {
            const splitInput = inputValue.replace('(', '').split(' ');

            if (splitInput.every(this.testForValidInputString)) { // Valid input tests
                const kvPair = splitInput[splitInput.length - 1];
                const chipKey = kvPair.substring(0, kvPair.indexOf('=')).trim();
                const chipValue = kvPair.substring(kvPair.indexOf('=') + 1, kvPair.length).trim();
                if (chipKey.includes('serviceName') && tracesEnabled) {
                    this.props.options.operationName.values = [];
                    this.props.operationStore.fetchOperations(chipValue, () => {
                        this.props.options.operationName.values = this.props.operationStore.operations;
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
            this.handleDropdownSelection();
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
            const chips = this.props.uiState.chips;
            if (!this.inputRef.value && chips.length) {
                e.preventDefault();
                this.modifyChip();
            }
        }
    }

    // Logic for when a user presses backspace to edit a chip
    modifyChip() {
        const chip = this.props.uiState.chips[this.props.uiState.chips.length - 1];
        const chipValue = chip.value;
        if (chip.key.includes('nested_')) { // Check for nested KV pairs
            let fullString = '';
            chipValue.forEach((nestedChip) => {
                const value = Autocomplete.checkForWhitespacedValue(nestedChip.value);
                fullString += `${nestedChip.key}${nestedChip.operator}${value} `;
            });
            this.inputRef.value = `(${fullString.trim()})`;
        } else {
            const value = Autocomplete.checkForWhitespacedValue(chipValue);
            this.inputRef.value = `${chip.key}${chip.operator}${value}`;
        }
        this.deleteChip(this.props.uiState.chips.length - 1);
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
                this.fillInputFromDropdownSelection();
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
                this.fillInputFromDropdownSelection();
            });
        }
    }

    // Test for correct formatting on K/V pairs
    testForValidInputString(kvPair) {
        if (/^(.+)([=><])(.+)$/g.test(kvPair)) { // Ensure format is a=b
            const indexOfoperator = Autocomplete.findIndexOfoperator(kvPair);
            const valueKey = kvPair.substring(0, indexOfoperator).trim();
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
        const inputValue = Autocomplete.removeWhiteSpaceAroundInput(this.inputRef.value);
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
        const rawSplitInput = formattedValue.split(' ');
        const splitInput = this.checkSplitInputForValuesWithWhitespace(rawSplitInput);
        if (splitInput && splitInput.every(this.testForValidInputString)) { // Valid input tests
            let chipKey = null;
            let chipValue = null;
            let operator = '=';

            if (splitInput.length > 1) {
                const chipIndex = Object.keys(this.props.uiState.chips).length; // Create nested object of KV pairs
                chipKey = `nested_${chipIndex}`;
                chipValue = [];
                splitInput.forEach((kvPair) => {
                    const trimmedPair = kvPair.trim();
                    const operatorIndex = Autocomplete.findIndexOfoperator(kvPair);
                    const key = trimmedPair.substring(0, operatorIndex);
                    const value = (trimmedPair.substring(operatorIndex + 1, kvPair.length)).replace(/"/g, '');
                    chipValue.push({key, value, operator: kvPair[operatorIndex]});
                });
            } else {
                const kvPair = splitInput[0];
                const operatorIndex = Autocomplete.findIndexOfoperator(kvPair);
                chipKey = kvPair.substring(0, operatorIndex).trim();
                chipValue = kvPair.substring(operatorIndex + 1, kvPair.length).trim().replace(/"/g, '');
                operator = kvPair[operatorIndex];
            }
            this.props.uiState.chips.push({key: chipKey, value: chipValue, operator});
            if (chipKey.includes('serviceName') && tracesEnabled) {
                this.props.options.operationName.values = [];
                this.props.operationStore.fetchOperations(chipValue, () => {
                    this.props.options.operationName.values = this.props.operationStore.operations;
                });
            }
            this.setState({inputError: false});
            this.inputRef.value = '';
        }
    }

    // Remove chip from client side store
    deleteChip(chipIndex) {
        const targetChip = this.props.uiState.chips[chipIndex];
        if (targetChip !== undefined) {
            const chipKey = targetChip.key;
            const chipsToSplice = chipKey.includes('nested_') ? [targetChip.value] : [targetChip];
            const updatedExistingKeys = this.state.existingKeys;
            chipsToSplice.forEach((chip) => {
                if (chip.key === 'serviceName') {
                    this.setState({
                        serviceName: null
                    });
                    this.props.options.operationName.values = [];
                }
                const itemIndex = updatedExistingKeys.indexOf(chip.key);
                updatedExistingKeys.splice(itemIndex, 1);
            });

            this.setState({existingKeys: updatedExistingKeys});
            this.props.uiState.chips.splice(chipIndex, 1);
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
                            handleSelection={this.handleDropdownSelection}
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
