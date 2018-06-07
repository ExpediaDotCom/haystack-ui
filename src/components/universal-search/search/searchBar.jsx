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
import tracesSearchStore from '../../traces/stores/tracesSearchStore';
import {toFieldsObject} from '../../traces/utils/traceQueryParser';

export default class extends React.Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        tracesSearchStore.fetchSearchResults(toFieldsObject(this.input.value), this.input.value);
        event.preventDefault();
    }

    render() {
        return (
            <article className="universal-search-bar search-query-bar">
                <section>
                    <form onSubmit={this.handleSubmit}>
                        <div className="search-bar-pickers">
                            <div className="search-bar-pickers_fields">
                                <div className="autosuggestion-box">
                                    <input type="text" className="search-bar-text-box" ref={(input) => { this.input = input; }} />
                                </div>
                            </div>
                            <div className="search-bar-pickers_time-window">
                                <span>
                                    <button className="btn btn-primary time-range-picker-toggle btn-lg" type="button">last 1 hour</button>
                                </span>
                            </div>
                            <div className="search-bar-pickers_submit">
                                <button className="btn btn-primary btn-lg traces-search-button" type="submit" onClick={this.handleSubmit}>
                                    <span className="ti-search"/>
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </article>
        );
    }
}
