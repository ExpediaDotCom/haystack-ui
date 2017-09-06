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

const TagsTable = ({binaryAnnotations}) => (
    <table className="table table-striped">
        <thead>
        <tr>
            <th>Key</th>
            <th>Value</th>
        </tr>
        </thead>
        <tbody>
        {binaryAnnotations.map(annotation =>
            (<tr key={annotation.key}>
                <td>{annotation.key}</td>
                <td>{annotation.value}</td>
            </tr>)
        )}
        </tbody>
    </table>);

TagsTable.propTypes = {
    binaryAnnotations: PropTypes.object.isRequired
};

export default TagsTable;
