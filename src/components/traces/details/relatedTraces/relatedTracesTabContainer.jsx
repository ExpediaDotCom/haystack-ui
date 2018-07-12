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

/*
 * TODO: Add comments!
 * 
 * 
 */


import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import Loading from '../../../common/loading';
import Error from '../../../common/error';
import RelatedTracesTab from './relatedTracesTab';
import uiState from '../../searchBar/searchBarUiStateStore';
import { toPresetDisplayText } from '../../utils/presets';

@observer
export default class RelatedTracesTabContainer extends React.Component {
    static propTypes = {
        traceId: PropTypes.string.isRequired,
        store: PropTypes.object.isRequired, // Trace Details Store
        isUniversalSearch: PropTypes.bool.isRequired
    };

    static timePresetOptions = [
        '5m',
        '15m',
        '1h',
        '4h',
        '12h',
        '24h',
        '3d'
    ];

    static fieldOptions = [
        {
            fieldTag: 'x-ha-ctx-trace-id',
            propertyToMatch: 'traceId',
            fieldDescription: 'page render traceid'
        },
        {
            fieldTag: 'x-ha-visitor-id',
            propertyToMatch: 'x-ha-visitor-id',
            fieldDescription: 'HomeAway visitor id'
        }
    ];

    constructor(props) {
        super(props);
        const selectedFieldIndex = 0;
        const selectedTimeIndex = 2; // Default 1h
        this.state = {
            selectedFieldIndex,
            selectedTimeIndex,
            availableFields: this.props.store.availableFields// compute the fields of the original trace
        };

        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.fetchRelatedTraces = this.fetchRelatedTraces.bind(this);
    }

    componentWillMount() {
        this.fetchRelatedTraces(this.state.selectedTimeIndex);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedTimeIndex !== prevState.selectedTimeIndex
            || this.state.selectedFieldIndex !== prevState.selectedFieldIndex) {
            this.fetchRelatedTraces();
        }
    }

    fetchRelatedTraces() {
        const chosenField = RelatedTracesTabContainer.fieldOptions[this.state.selectedFieldIndex];
        if (!this.state.availableFields[chosenField.propertyToMatch] && chosenField.propertyToMatch !== 'traceId') {
            return this.props.store.fieldIsNotAProperty();
        }
        const query = {
            serviceName: uiState.serviceName,
            [chosenField.fieldTag]: this.props[chosenField.propertyToMatch],
            timePreset: RelatedTracesTabContainer.timePresetOptions[this.state.selectedTimeIndex]
        };
        return this.props.store.fetchRelatedTraces(query);
    }
    
    handleFieldChange(event) {
        const selectedFieldIndex = event.target.value;
        this.setState({
            selectedFieldIndex
        });
    }

    handleTimeChange(event) {
        const selectedTimeIndex = event.target.value;
        this.setState({
            selectedTimeIndex
        });
    }

    render() {
        const { store, isUniversalSearch } = this.props;
        const { selectedTimeIndex, selectedFieldIndex} = this.state;

        return (
            <section>
                <div className="text-left">
                    <span>Relate Traces by: </span>
                    <select className="time-range-selector" value={selectedFieldIndex} onChange={this.handleFieldChange}>
                            {RelatedTracesTabContainer.fieldOptions.map((fieldOp, index) => (
                                <option
                                    key={fieldOp.fieldTag}
                                    value={index}
                                >{fieldOp.fieldDescription}</option>))}
                    </select>
                    <span style={{paddingLeft: '5px'}}>Related Traces for </span>
                    <select className="time-range-selector" value={selectedTimeIndex} onChange={this.handleTimeChange}>
                        {RelatedTracesTabContainer.timePresetOptions.map((preset, index) => (
                            <option
                                key={preset}
                                value={index}
                            >{toPresetDisplayText(preset)}</option>))}
                    </select>
                </div>
                { store.relatedTracesPromiseState && store.relatedTracesPromiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        fulfilled: () => ((store.relatedTraces && store.relatedTraces.length)
                                ? <RelatedTracesTab uiState={uiState} relatedTraces={store.relatedTraces} isUniversalSearch={isUniversalSearch}/>
                                : <Error />)
                    })
                }
            </section>
        );
    }
}
