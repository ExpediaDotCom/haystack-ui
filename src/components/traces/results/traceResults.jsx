/*
 * Copyright 2018 Expedia Group
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
import SpanSearchStore from '../stores/spansSearchStore';
import SpansView from './spansView';
import Error from '../../common/error';
import NoSearch from './noSearch';
import '../traces.less';

@observer
export default class TraceResults extends React.Component {
    static propTypes = {
        tracesSearchStore: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
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
        const traceIds = this.props.tracesSearchStore.searchResults.map(t => t.traceId);

        const TracesContainer = ({searchQuery, results, totalCount, ids}) => (
            <article>
                <div className="trace-result-summary">
                    {results.length > 1 ?
                        <span>
                            <span>Showing latest <b>{results.length}</b> {results.length === 1 ? 'trace' : 'traces'} out of total {totalCount ? <b>{totalCount}</b> : null} for time window. </span>
                            <span className="text-muted text-right">Select a timeline bar to drill down.</span>
                        </span> : null}
                </div>
                <div className="trace-result-view-selector text-center">
                    <div className="btn-group btn-group-sm">
                        <button className={showSpans ? 'btn btn-sm btn-default' : 'btn btn-sm btn-primary'} onClick={() => this.toggleView()}>Traces View</button>
                        <button className={!showSpans ? 'btn btn-sm btn-default' : 'btn btn-sm btn-primary'} onClick={() => this.toggleView()}>Spans View</button>
                    </div>
                </div>
                <section>
                    {
                        showSpans
                            ? (<SpansView
                                traceIds={ids}
                                location={{}}
                                store={SpanSearchStore}
                            />)
                            : (<TraceResultsTable
                                query={searchQuery}
                                results={results}
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
                        ? <TraceTimeline store={this.props.tracesSearchStore} history={this.props.history} />
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
                                ids={traceIds}
                            />
                            : <Error errorMessage={'No results found, please try expanding your query.'}/>)
                    })
                }
            </section>
        );
    }
}
