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
import QueryBank from './queryBank';
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
export default class Autosuggest extends React.Component {
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
        if (inputString.includes('"')) {
            return ((inputString.match(/"/g) || []).length === 2);
        }
        return /^([a-zA-Z0-9\s-]+)([=><])([a-zA-Z0-9,\s-:/_".#$+!%@^&?<>]+)$/g.test(inputString);
    }

    static findIndexOfOperator(inputString) {
        const match = inputString.match(/([=><])/);
        return match && match.index;
    }

    static removeWhiteSpaceAroundInput(inputString) {
        const operatorIndex = Autosuggest.findIndexOfOperator(inputString);

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
        this.addChipToPendingQueries = this.addChipToPendingQueries.bind(this);
        this.modifyChip = this.modifyChip.bind(this);
        this.modifyQuery = this.modifyQuery.bind(this);
        this.deleteChip = this.deleteChip.bind(this);
        this.deleteQuery = this.deleteQuery.bind(this);
        this.testForValidInputString = this.testForValidInputString.bind(this);
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
        const serviceName = this.props.uiState.serviceName;
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
        const formattedInput = Autosuggest.removeWhiteSpaceAroundInput(input);
        const operatorIndex = Autosuggest.findIndexOfOperator(formattedInput);

        let value;
        let type;
        if (operatorIndex) {
            type = 'Values';
            const key = formattedInput.substring(0, operatorIndex).trim();
            value = formattedInput.substring(operatorIndex + 1, formattedInput.length).trim().replace('"', '');
            if (this.props.options[key] && this.props.options[key].values) {
                this.props.options[key].values.forEach((option) => {
                    if (option.toLowerCase().includes(value.toLowerCase()) && option !== value) {
                        suggestionArray.push({value: option});
                    }
                });
            }
        } else if (this.inputMatchesRangeKey(formattedInput)) {
            type = 'Operator';
            suggestionArray = [{value: '>'}, {value: '='}, {value: '<'}];
            value = '';
        } else {
            type = 'Keys';
            value = formattedInput.toLowerCase();
            Object.keys(this.props.options).forEach((option) => {
                if (option.toLowerCase().includes(value) && option !== value) {
                    suggestionArray.push({value: option, description: this.props.options[option].description});
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
            this.addChipToPendingQueries();
        }
        this.props.search();
    }

    // Selection choice fill when navigating with arrow keys
    fillInputFromDropdownSelection() {
        const formattedInput = Autosuggest.removeWhiteSpaceAroundInput(this.inputRef.value);
        const operatorIndex = Autosuggest.findIndexOfOperator(formattedInput);
        let fillValue = '';
        let value = this.state.suggestionStrings[this.state.suggestionIndex || 0].value;
        value = Autosuggest.checkForWhitespacedValue(value);
        if (this.state.suggestedOnType === 'operator') {
            const slicedInput = formattedInput.replace(/[(>=<)]/, '');
            fillValue = `${slicedInput}${value}`;
        } else if (operatorIndex) {
            const operator = formattedInput[operatorIndex];
            const key = formattedInput.substring(0, operatorIndex);
            fillValue = `${key}${operator}${value}`;
        } else {
            fillValue = value;
        }
        this.inputRef.value = fillValue;
    }

    // Selection chose when clicking or pressing space/tab/enter
    handleDropdownSelection() {
        this.fillInputFromDropdownSelection();
        this.handleBlur();
        this.inputRef.focus();
        if (!Autosuggest.findIndexOfOperator(this.inputRef.value)) {
            if (!this.inputMatchesRangeKey(this.inputRef.value)) this.inputRef.value = `${this.inputRef.value}=`;
            this.setState({
                suggestionStrings: []
            }, () => {
                this.setSuggestions(this.inputRef.value);
            });
        }
        if (this.state.suggestedOnType === 'Values') this.addChipToPendingQueries();
    }

    // Logic for when the user pastes into search bar
    handlePaste(e) {
        e.preventDefault();
        const splitPastedText = e.clipboardData.getData('Text').split('');
        splitPastedText.forEach((char) => {
            this.inputRef.value += char;
            if (char === ' ') this.handleKeyPress({keyCode: SPACE, preventDefault: () => {}});
        });
        if (Autosuggest.completeInputString(this.inputRef.value)) this.addChipToPendingQueries();
    }

    // Logic for navigation and selection with keyboard presses
    handleKeyPress(e) {
        const keyPressed = e.keyCode || e.which;
        if ((keyPressed === ENTER || keyPressed === TAB) && this.state.suggestionStrings.length && this.inputRef.value.trim().length) {
            e.preventDefault();
            if (this.state.suggestionIndex !== null || this.state.suggestionStrings.length === 1) {
                this.handleDropdownSelection();
                this.handleBlur();
            }
        } else if (keyPressed === ENTER) {
            e.preventDefault();
            if (this.inputRef.value.trim().length) {
                this.addChipToPendingQueries();
            } else if (this.props.uiState.pendingQuery.length) {
                this.handleBlur();
                this.props.search();
            }
        } else if (keyPressed === TAB && this.inputRef.value) {
            e.preventDefault();
            this.addChipToPendingQueries();
        } else if (keyPressed === SPACE) {
            if (Autosuggest.completeInputString(this.inputRef.value.trim())) {
                e.preventDefault();
                this.addChipToPendingQueries();
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
            const chips = this.props.uiState.pendingQuery;
            if (!this.inputRef.value && chips.length) {
                e.preventDefault();
                this.modifyChip();
                this.updateFieldKv(e);
            }
        }
    }

    // Logic for when a user presses backspace to edit a chip
    modifyChip() {
        const chip = this.props.uiState.pendingQuery[this.props.uiState.pendingQuery.length - 1];
        const value = Autosuggest.checkForWhitespacedValue(chip.value);
        this.inputRef.value = `${chip.key}${chip.operator}${value}`;
        this.deleteChip(this.props.uiState.pendingQuery.length - 1);
    }

    // Logic for clicking on an existing query object below the search bar
    modifyQuery(index) {
        this.props.uiState.pendingQuery = this.props.uiState.queries[index];
        this.inputRef.value = '';
        this.deleteQuery(index, false);
        this.inputRef.focus();
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
            const indexOfOperator = Autosuggest.findIndexOfOperator(kvPair);
            const valueKey = kvPair.substring(0, indexOfOperator).trim();
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
            inputError: 'Invalid K/V Pair, please use format "abc=xyz"'
        });
        return false;
    }

    // Adds inputted text chip to client side store
    addChipToPendingQueries() {
        this.handleBlur();
        const inputValue = Autosuggest.removeWhiteSpaceAroundInput(this.inputRef.value);
        if (!inputValue) return;
        if (this.testForValidInputString(inputValue)) { // Valid input tests
            const kvPair = inputValue;
            const operatorIndex = Autosuggest.findIndexOfOperator(kvPair);
            const chipKey = kvPair.substring(0, operatorIndex).trim();
            const chipValue = kvPair.substring(operatorIndex + 1, kvPair.length).trim().replace(/"/g, '');
            const operator = kvPair[operatorIndex];
            this.props.uiState.pendingQuery.push({query: this.state.query, key: chipKey, value: chipValue, operator});
            if (chipKey.includes('serviceName') && tracesEnabled) {
                this.props.uiState.serviceName = chipValue;
                this.props.options.operationName.values = [];
                this.props.operationStore.fetchOperations(chipValue, () => {
                    this.props.options.operationName.values = this.props.operationStore.operations;
                });
            }
            this.setState({inputError: false});
            this.inputRef.value = '';
        }
    }

    // Remove pending chip from client side store
    deleteChip(chipIndex) {
        const targetChip = this.props.uiState.pendingQuery[chipIndex];
        if (targetChip !== undefined) {
            const updatedExistingKeys = this.state.existingKeys;
            if (targetChip.key === 'serviceName') {
                this.setState({
                    serviceName: null
                });
                this.props.options.operationName.values = [];
            }
            const itemIndex = updatedExistingKeys.indexOf(targetChip.key);
            updatedExistingKeys.splice(itemIndex, 1);

            this.setState({existingKeys: updatedExistingKeys});
            this.props.uiState.pendingQuery.splice(chipIndex, 1);
        }
    }

    // Remove query from client side store
    deleteQuery(queryIndex, searchAfterDelete) {
        const targetQuery = this.props.uiState.queries[queryIndex];
        if (targetQuery !== undefined) {
            const updatedExistingKeys = this.state.existingKeys;
            if (targetQuery.some(kv => kv.key === 'serviceName')) {
                this.setState({
                    serviceName: null
                });
                this.props.options.operationName.values = [];
            }
            const itemIndex = updatedExistingKeys.indexOf(targetQuery.key);
            updatedExistingKeys.splice(itemIndex, 1);

            this.setState({existingKeys: updatedExistingKeys});
            this.props.uiState.queries.splice(queryIndex, 1);
        }
        if (searchAfterDelete) {
            this.handleSearch();
        }
    }

    render() {
        const uiState = this.props.uiState;

        const ErrorMessaging = ({inputError}) => (inputError ? <div className="usb-search__error-message">{this.state.inputError}</div> : null);

        return (
            <article className="usb-wrapper">
                <div className="usb-search" role="form" onClick={Autosuggest.focusInput}>
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
                            placeholder={uiState.pendingQuery.length ? '' : 'Search tags and services...'}
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
                        <Guide searchHistory={uiState.searchHistory}/>
                    </div>
                </div>
                <QueryBank uiState={uiState} modifyQuery={this.modifyQuery} deleteQuery={this.deleteQuery} />
                <ErrorMessaging inputError={this.state.inputError}/>
            </article>
        );
    }
}
