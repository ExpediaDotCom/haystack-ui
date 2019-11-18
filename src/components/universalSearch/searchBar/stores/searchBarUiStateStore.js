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

import {observable, action} from 'mobx';

export class SearchBarUiStateStore {
    @observable serviceName = null;
    @observable operationName = null;
    @observable fieldsKvString = null;
    @observable timeWindow = null;
    @observable interval = 'FiveMinute';
    @observable chips = [];
    @observable displayErrors = {};
    @observable tabId = null;

    @action init(search) {
        // initialize observables using search object
        this.setStateFromSearch(search);
    }

    static setOperatorFromValue(value) {
        // operator set from the first character of the value of a KV pair, there is likely a cleaner solution than this
        return value[0] === '>' || value[0] === '<' ? value[0] : '=';
    }

    static checkKeyForPeriods(key, value) {
        // recursively check for keys that have one or more period in it, e.g. http.status.code
        if (typeof value !== 'string') {
            const newKey = Object.keys(value)[0];
            const tail = SearchBarUiStateStore.checkKeyForPeriods(newKey, value[newKey]);
            return `${key}.${tail}`;
        }
        return key;
    }

    static checkValueForPeriods(value) {
        // recursively check for values in objects where the key has a period in it
        if (typeof value === 'object') {
            const key = Object.keys(value)[0];
            return SearchBarUiStateStore.checkValueForPeriods(value[key]);
        }
        return value;
    }

    static createChip(key, value) {
        const checkedKey = SearchBarUiStateStore.checkKeyForPeriods(key, value);
        let checkedValue = SearchBarUiStateStore.checkValueForPeriods(value);
        const operator = SearchBarUiStateStore.setOperatorFromValue(value);
        checkedValue = operator === '=' ? checkedValue : value.substr(1, checkedValue.length);

        return {key: checkedKey, value: checkedValue, operator};
    }

    static turnChipsIntoSearch(chips) {
        const search = {};
        chips.forEach((chip) => {
            const key = chip.key;
            let value;
            if (key.includes('nested_')) {
                value = {};
                chip.value.forEach((nestedChip) => {
                    // prepend value with operator in case of range query operator
                    value[nestedChip.key] = nestedChip.operator !== '=' ? `${nestedChip.operator}${nestedChip.value}` : nestedChip.value;
                });
            } else {
                value = chip.operator !== '=' ? `${chip.operator}${chip.value}` : chip.value;
            }

            search[key] = value;
        });
        return search;
    }

    static setSearchUrlCookie(historyArray) {
        const date = new Date();
        date.setTime(date.getTime() + (24 * 60 * 60 * 1000)); // set cookie expiration date for one day
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `searchhistory=${JSON.stringify(historyArray)};${expires};path=/`;
    }

    getSearchUrlCookie() { // eslint-disable-line
        const cookie = document.cookie.split(';');
        for (let i = 0; i < cookie.length; i++) {
            const inspect = cookie[i];
            if (inspect.indexOf('searchhistory') === 0) {
                return JSON.parse(inspect.substring('searchhistory='.length, inspect.length));
            }
        }
        return [];
    }

    addLocationToSearchUrlCookie() {
        const location = document.location.search;
        const searchHistory = this.getSearchUrlCookie();
        if (location && searchHistory[searchHistory.length - 1] !== location) {
            searchHistory.push(location);
            if (searchHistory.length > 5) {
                searchHistory.shift();
            }
            SearchBarUiStateStore.setSearchUrlCookie(searchHistory);
        }
    }

    getCurrentSearch() {
        // construct current search object using observables
        const search = SearchBarUiStateStore.turnChipsIntoSearch(this.chips);

        const showAllTabs = Object.keys(search).every((key) => key === 'serviceName' || key === 'operationName') || this.tabId === 'serviceInsights';

        if (this.tabId && showAllTabs) {
            search.tabId = this.tabId;
        }
        if (this.timeWindow.startTime && this.timeWindow.endTime) {
            search.time = {
                from: this.timeWindow.startTime,
                to: this.timeWindow.endTime
            };
        } else if (this.timeWindow.timePreset) {
            search.time = {
                preset: this.timeWindow.timePreset
            };
        }

        return search;
    }

    @action setStateFromSearch(search) {
        // url query keys that we don't want as chips
        const noChips = new Set(['type', 'useExpressionTree', 'spanLevelFilters', 'interval', 'relationship', 'debug']);
        // construct observables from search
        this.chips = [];
        this.serviceName = search.serviceName;
        this.operationName = search.operationName;
        Object.keys(search).forEach((key) => {
            if (key === 'time') {
                this.timeWindow = {startTime: search[key].from, endTime: search[key].to, timePreset: search[key].preset};
            } else if (key === 'tabId') {
                this.tabId = search[key];
            } else if (!noChips.has(key)) {
                if (key.includes('nested_')) {
                    // construct nested chips, checking for service and operation names
                    const value = Object.keys(search[key]).map((nestedKey) => {
                        const chip = SearchBarUiStateStore.createChip(nestedKey, search[key][nestedKey]);
                        if (chip.key === 'serviceName') this.serviceName = chip.value;
                        if (chip.key === 'operationName') this.operationName = chip.value;
                        return chip;
                    });
                    this.chips.push({key, value, operator: '='});
                } else {
                    this.chips.push(SearchBarUiStateStore.createChip(key, search[key]));
                }
            }
        });
        this.addLocationToSearchUrlCookie(); // add search to history list in search bar
    }

    @action setTimeWindow(timeWindow) {
        this.timeWindow = timeWindow;
    }

    @action setFieldsUsingKvString(fieldsKvString) {
        this.fieldsKvString = fieldsKvString;
    }
}

export default new SearchBarUiStateStore();
