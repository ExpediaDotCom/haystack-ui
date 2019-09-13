/*
 * Copyright 2019 Expedia Group
 *
 *       Licensed under the Apache License, Version 2.0 (the 'License");
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

import {expect} from 'chai';

const {SearchBarUiStateStore} = require('../../../../../../src/components/universalSearch/searchBar/stores/searchBarUiStateStore.js');

describe('class SearchBarUiStateStore()', () => {
    const mockSearch = {
        tabId: 'traces',
        time: {
            to: 2,
            from: 1
        }
    };
    let MockSearchBarUiStateStore;
    beforeEach(() => {
        MockSearchBarUiStateStore = new SearchBarUiStateStore();
        MockSearchBarUiStateStore.init(mockSearch);
    });
    it('initializes store properly', () => {
        MockSearchBarUiStateStore.init(mockSearch);
        expect(MockSearchBarUiStateStore.getCurrentSearch()).to.deep.equal({
            tabId: 'traces',
            time: {
                from: 1,
                to: 2
            }
        });
    });

    it('properly processes chips', () => {
        const chips = [
            {
                key: 'foo',
                operator: '=',
                value: 'bar'
            },
            {
                key: 'nested_foo',
                operator: '>',
                value: [
                    {
                        key: 'foo_sub',
                        operator: '=',
                        value: 'bar_sub'
                    }
                ]
            }
        ];
        const result = SearchBarUiStateStore.turnChipsIntoSearch(chips);
        expect(result).to.deep.equal({
            foo: 'bar',
            nested_foo: {
                foo_sub: 'bar_sub'
            }
        });
    });
});
