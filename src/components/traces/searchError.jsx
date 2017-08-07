/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
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

import React from 'react';

const errorStyle = {
    borderRadius: '10px',
    padding: '10px',
    margin: '100px 0 150px 0',
    color: '#aaa'
};

export default () => (
    <div className="row text-center" style={errorStyle}>
        <h4>Network Error - please ensure that the API is properly connected.</h4>
        <h5>Please consult the <a href="https://github.com/ExpediaDotCom/haystack/">documentation</a> for troubleshooting.</h5>
    </div>
);

