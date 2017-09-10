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
import PropTypes from 'prop-types';
import ServiceOperationPicker from './serviceOperationPicker';
import FieldsPicker from './fieldsPicker';
import TimeWindowPicker from './timeWindowPicker';
import {extractSecondaryFields} from '../utils/traceQueryParser';
import uiState from './searchBarUiStateStore';
import './searchBar.less';

export default class SearchQueryBar extends React.Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        searchCallback: PropTypes.func.isRequired
    };

    static createUiStateUsingQuery(query) {
        uiState.setServiceOperation({
            serviceName: query.serviceName,
            operationName: query.operationName
        });

        uiState.setFields(extractSecondaryFields(query));

        uiState.setTimeWindow({
            timePreset: query.timePreset,
            startTime: query.startTime,
            endTime: query.endTime
        });

        uiState.resetErrors();
    }

    constructor(props) {
        super(props);
        SearchQueryBar.createUiStateUsingQuery(this.props.query);
        this.state = {errors: null};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        console.log('nextprops');
        console.log(nextProps);

        SearchQueryBar.createUiStateUsingQuery(nextProps.query);
        this.setState({errors: null});
    }

    handleSubmit(event) {
        this.search();
        event.preventDefault();
    }

    search() {
      console.log({
        ...uiState.serviceOperation,
        ...uiState.fields,
        ...uiState.timeWindow
      });

      if (uiState.serviceOperationError || uiState.fieldsError || uiState.timeWindowError) {
            this.setState({errors: {
                serviceOperationError: uiState.serviceOperationError,
                fieldsError: uiState.fieldsError,
                timeWindowError: uiState.timeWindowError
            }});
        } else {
            this.props.searchCallback({
                ...uiState.serviceOperation,
                ...uiState.fields,
                ...uiState.timeWindow
            });
        }
    }

    render() {
        console.log('rendered!');
        return (
            <article className="search-query-bar">
                <section>
                    <form className="input-group input-group-lg" onSubmit={this.handleSubmit}>
                        <ServiceOperationPicker />
                        <FieldsPicker />
                        <TimeWindowPicker />

                        <span className="input-group-btn">
                            <button className="btn btn-primary traces-search-button" type="button" onClick={this.search}>
                                <span className="ti-search"/>
                            </button>
                        </span>
                    </form>
                </section>
                <section>
                    { (this.state.errors)
                        ? <div className="traces-error-message">
                            {this.state.errors.serviceOperationError ? <div>Invalid service or operation name</div> : null}
                            {this.state.errors.fieldsError ? <div>Invalid query, expected format is <span className="traces-error-message__code"> tag1=value1 tag2=value2 [...]</span></div> : null}
                            {this.state.errors.timeWindowError ? <div>Invalid date</div> : null}
                        </div>
                        : null
                    }
                </section>
            </article>
        );
    }
}
