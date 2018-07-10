/*
 * Copyright 2018 Expedia, Inc.
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
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import Loading from '../../../common/loading';
import Error from '../../../common/error';
import RelatedTracesTab from './relatedTracesTab';

@observer
export default class extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired,
        store: PropTypes.object.isRequired,
        isUniversalSearch: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        const tags = ['x-ha-ctx-trace-id'];
        const selectedTag = tags[0];
        this.state = {
            tags,
            selectedTag
        };

        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    componentWillMount() {
        this.props.store.fetchRelatedTraces({
            serviceName: 'browser-open-tracing',
            timePreset: '12h',
            'x-ha-ctx-trace-id': this.props.traceId
        });
    }
    
    handleTimeChange(event) {
        const selectedTag = event.target.value;
        this.setState({
            selectedTag
        });
    }

    render() {
        const { store, isUniversalSearch } = this.props;
        const { tags, selectedTag } = this.state;
        return (
            <section>
                <div className="text-left" style={{position: 'absolute'}}>
                    <span>Relate Traces by: </span>
                    <select className="time-range-selector" value={selectedTag} onChange={this.handleTimeChange}>
                            {tags.map((tagName, index) => (
                                <option
                                    key={tagName}
                                    value={index}
                                >{tagName}</option>))}
                    </select>
                </div>
                { store.relatedTracesPromiseState && store.relatedTracesPromiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        fulfilled: () => ((store.relatedTraces && store.relatedTraces.length)
                                ? <RelatedTracesTab relatedTraces={store.relatedTraces} isUniversalSearch={isUniversalSearch}/>
                                : <Error />)
                    })
                }
            </section>
        );
    }
}
