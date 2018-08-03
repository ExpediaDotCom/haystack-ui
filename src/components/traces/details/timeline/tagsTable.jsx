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
import _ from 'lodash';
import validUrl from '../../../../utils/validUrl';

const TagsTable = ({tags}) => {
    const unique = _.uniqBy(tags, tag => tag.key.toLowerCase());
    const sortedTags = _.sortBy(unique, [tag => tag.key.toLowerCase()]);

    if (sortedTags.length) {
        return (<table className="table table-striped">
            <thead>
            <tr>
                <th>Key</th>
                <th>Value</th>
            </tr>
            </thead>
            <tbody>
            {sortedTags.map(tag =>
                (<tr className="non-highlight-row" key={Math.random()}>
                    <td>{tag.key}</td>
                    <td>
                        {validUrl.isUrl(tag.value) ?
                            (
                                <a href={tag.value} target="_blank">
                                    <span className="ti-new-window"/> <span>{tag.value}</span>
                                </a>
                            ) :
                            (<span>{`${tag.value}`}</span>)
                        }
                    </td>
                </tr>)
            )}
            </tbody>
        </table>);
    }

    return <h6>No tags associated with span</h6>;
};

TagsTable.propTypes = {
    tags: PropTypes.object.isRequired
};

export default TagsTable;
