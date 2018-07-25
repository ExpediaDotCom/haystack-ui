/*
 * Copyright 2018 Expedia, Inc.
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
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

import TraceTimeline from './traceTimeline';
import Loading from '../../common/loading';
import TraceResultsTable from './traceResultsTable';
import Error from '../../common/error';
import NoSearch from './noSearch';

@observer
export default class TraceResults extends React.Component {
    static propTypes = {
        tracesSearchStore: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        isUniversalSearch: PropTypes.bool
    };

    static defaultProps = {
        isUniversalSearch: false
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.toggleView = this.toggleView.bind(this);
    }

    toggleView() {
        this.setState({showSpans: !this.state.showSpans});
    }

    render() {
        const showSpans = this.state.showSpans;
        const TracesContainer = ({searchQuery, results, totalCount, isUniversalSearch}) => (
            <article>
                <div className="trace-result-summary clearfix">
                    <div className="pull-left">
                        <span>Showing latest <b>{results.length}</b> {results.length === 1 ? 'trace' : 'traces'} out of total {totalCount ? <b>{totalCount}</b> : null} for time window. </span>
                        {results.length > 1 ? <span className="text-muted text-right">Select a timeline bar to drill down.</span> : null}
                    </div>
                    <div className="pull-right">
                        <span>View </span>
                        <div className="btn-group btn-group-sm">
                            <button className={showSpans ? 'btn btn-sm btn-default' : 'btn btn-sm btn-primary'} onClick={() => this.toggleView()}>Traces</button>
                            <button className={!showSpans ? 'btn btn-sm btn-default' : 'btn btn-sm btn-primary'} onClick={() => this.toggleView()}>Spans</button>
                        </div>
                    </div>
                </div>
                <section>
                    {
                        showSpans
                            ? (<div>spans</div>)
                            : (<TraceResultsTable
                                query={searchQuery}
                                results={results}
                                isUniversalSearch={isUniversalSearch}
                            />)
                    }
                </section>
            </article>
            );

        return (
            <section>
                { !this.props.tracesSearchStore.apiQuery.traceId && this.props.tracesSearchStore.timelinePromiseState && this.props.tracesSearchStore.timelinePromiseState.case({
                    pending: () => <div className="text-center timeline-loader">Loading timeline...</div>,
                    rejected: () => <Error />,
                    empty: () => <div />,
                    fulfilled: () => (
                        (this.props.tracesSearchStore.timelineResults && this.props.tracesSearchStore.timelineResults.length)
                        ? <TraceTimeline store={this.props.tracesSearchStore} history={this.props.history} isUniversalSearch={this.props.isUniversalSearch}/>
                        : null)
                })
                }
                { this.props.tracesSearchStore.traceResultsPromiseState && this.props.tracesSearchStore.traceResultsPromiseState.case({
                        pending: () => <Loading />,
                        rejected: () => <Error />,
                        empty: () => <NoSearch />,
                        fulfilled: () => ((this.props.tracesSearchStore.searchResults && this.props.tracesSearchStore.searchResults.length)
                            ? <TracesContainer
                                searchQuery={this.props.tracesSearchStore.searchQuery}
                                results={this.props.tracesSearchStore.searchResults}
                                totalCount={this.props.tracesSearchStore.totalCount}
                                isUniversalSearch={this.props.isUniversalSearch}
                            />
                            : <Error />)
                    })
                }
            </section>
        );
    }
}
