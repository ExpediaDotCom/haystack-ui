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
import PropTypes from 'prop-types';

export default class TagsFilter extends React.Component {
    static propTypes = {
        filterHandler: PropTypes.func.isRequired
    };

    static hasTagsWithFilters(tags, parsedFilters) {
        return tags.some(tag => parsedFilters.some(filter => tag && `${tag.key}=${tag.value}`.includes(filter)));
    }
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        const parsedFilters = event.target.value.split(/[\s,;]+/);

        this.props.filterHandler({ callback: (tags) => {
            if (event.target) {
                if (/^\s*$/.test(event.target.value)) return true;
                return TagsFilter.hasTagsWithFilters(tags, parsedFilters);
            }

            if (/^\s*$/.test(this.state.value)) return true;
            return TagsFilter.hasTagsWithFilters(tags, parsedFilters);
        }});
    }

    render() {
        return (
            <div>
                <input
                    className="filter text-filter form-control"
                    type="text"
                    placeholder="Filter tags..."
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
