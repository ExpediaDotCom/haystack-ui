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
import {observer} from 'mobx-react';

import CountGraph from './countGraph';
import DurationGraph from './durationGraph';
import SuccessGraph from './successGraph';

@observer
export default class GraphContainer extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired
    };
    render() {
        const {
            count,
            meanDuration,
            tp95Duration,
            tp99Duration,
            failureCount,
            successCount
        } = this.props.store.operationResults;
        return (
            <div className="row">
                <CountGraph points={count} />
                <DurationGraph meanPoints={meanDuration} tp95Points={tp95Duration} tp99Points={tp99Duration} />
                <SuccessGraph successCount={successCount} failureCount={failureCount} />
            </div>
        );
    }
}
