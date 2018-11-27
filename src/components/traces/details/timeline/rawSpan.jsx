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
import Loading from '../../../common/loading';
import Error from '../../../common/error';

@observer
export default class RawSpan extends React.Component {
    static propTypes = {
        rawSpanStore: PropTypes.object.isRequired,
        duplicateSpanId: PropTypes.bool.isRequired
    };

    render() {
        const {rawSpanStore, duplicateSpanId} = this.props;

        return (
                <div>
                    {
                        rawSpanStore.promiseState &&
                        rawSpanStore.promiseState.case({
                            pending: () => <Loading />,
                            rejected: () => <Error />,
                            fulfilled: () => {
                                if (rawSpanStore.rawSpan) {
                                    return (
                                        <div>
                                            {duplicateSpanId && <div>
                                                <strong>Client and Server Span ID are identical - results may be incorrect. Check the raw trace for full span list.</strong>
                                            </div>}
                                            <pre className="raw-span">{JSON.stringify(rawSpanStore.rawSpan, null, 2)}</pre>
                                        </div>);
                                }

                                return <Error errorMessage="There was a problem displaying the raw span. Please try again later."/>;
                            }
                        })
                    }
                </div>);
    }
}
