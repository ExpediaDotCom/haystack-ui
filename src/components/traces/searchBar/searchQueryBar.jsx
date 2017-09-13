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
import {observer} from 'mobx-react';
import ServicePicker from './pickers/servicePicker';
import OperationPicker from './pickers/operationPicker';
import FieldsPicker from './pickers/fieldsPicker';
import TimeWindowPicker from './pickers/timeWindowPicker';
import uiState from './searchBarUiStateStore';
import {toFieldsObject, isValidFieldKvString, dateIsValid} from '../utils/traceQueryParser';
import './searchBar.less';

@observer
export default class SearchQueryBar extends React.Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        searchCallback: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.search = this.search.bind(this);

        uiState.initUsingQuery(this.props.query);
    }

    componentWillReceiveProps(nextProps) {
        uiState.initUsingQuery(nextProps.query);
    }

    handleSubmit(event) {
        this.search();
        event.preventDefault();
    }

    search() {
      const fieldError = !isValidFieldKvString(uiState.fieldsKvString);
      const timeWindowError = !dateIsValid(...uiState.timeWindow);

      // trigger search only if searchBar is in valid state
      if (fieldError || timeWindowError) {
            uiState.setDisplayErrors({fieldError, timeWindowError});
        } else {
            this.props.searchCallback({
                serviceName: uiState.serviceName,
                operationName: uiState.operationName,
                ...toFieldsObject(uiState.fieldsKvString),
                ...uiState.timeWindow
            });
        }
    }

    render() {
        return (
            <article className="search-query-bar">
                <section>
                    <form onSubmit={this.handleSubmit}>
                      <div className="search-bar-headers">
                        <div className="search-bar-headers_service">Service</div>
                        <div className="search-bar-headers_operation">Operation</div>
                        <div className="search-bar-headers_fields">Fields <i>(in key=value format)</i></div>
                      </div>
                      <div className="search-bar-pickers">
                          <ServicePicker uiState={uiState}/>
                          <OperationPicker uiState={uiState}/>
                          <FieldsPicker uiState={uiState}/>
                          <TimeWindowPicker uiState={uiState}/>
                          <div className="search-bar-pickers_submit">
                            <button className="btn btn-primary btn-lg traces-search-button" type="submit" onClick={this.handleSubmit}>
                                <span className="ti-search"/>
                            </button>
                          </div>
                      </div>
                    </form>
                </section>
                <section>
                    { (uiState.displayErrors.fieldError || uiState.displayErrors.timeWindowError)
                        ? <div className="traces-error-message">
                            {uiState.displayErrors.fieldError ? <div className="traces-error-message_item">Invalid query, expected format is <span className="traces-error-message__code"> tag1=value1 tag2=value2 [...]</span></div> : null}
                            {uiState.displayErrors.timeWindowError ? <div className="traces-error-message_item">Invalid date</div> : null}
                        </div>
                        : null
                    }
                </section>
            </article>
        );
    }
}
