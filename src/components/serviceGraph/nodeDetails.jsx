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
import PropTypes from 'prop-types';

const NodeDetails = ({incomingEdges, outgoingEdges, tags}) => (
        <article>
            <div className="row">
                <section className="col-md-4">
                    <div className="service-graph__info">
                        <span className="service-graph__info-header">Tags</span>
                    </div>
                    <table className="service-graph__info-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            Object.keys(tags).length
                                ? Object.keys(tags).map(tagKey => (
                                    <tr>
                                        <td>{tagKey}</td>
                                        <td>{tags[tagKey]}</td>
                                    </tr>
                                ))
                                : <tr><td>NA</td><td/></tr>
                        }
                        </tbody>
                    </table>
                </section>
                <section className="col-md-4">
                    <div className="service-graph__info">
                        <span className="service-graph__info-header">Incoming Traffic</span> <span className="service-graph__info-sub">(last 1 hour average)</span>
                    </div>
                    <table className="service-graph__info-table">
                        <thead>
                        <tr>
                            <th>service</th>
                            <th>Rq/sec</th>
                            <th>Errors/sec</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            incomingEdges && incomingEdges.length
                                ? incomingEdges.sort((a, b) => a.stats.count - b.stats.count).map(edge => (
                                    <tr>
                                        <td>{edge.source.name}</td>
                                        <td>{edge.stats.count.toFixed(2)}</td>
                                        <td>{edge.stats.errorCount.toFixed(2)}%</td>
                                    </tr>
                                ))
                                : <tr><td>NA</td><td/><td/></tr>
                        }
                        </tbody>
                    </table>
                </section>
                <section className="col-md-4">
                    <div className="service-graph__info">
                        <span className="service-graph__info-header">Outgoing Traffic</span> <span className="service-graph__info-sub">(last 1 hour average)</span>
                    </div>
                    <table className="service-graph__info-table">
                        <thead>
                        <tr>
                            <th>service</th>
                            <th>Rq/sec</th>
                            <th>Errors/sec</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            outgoingEdges && outgoingEdges.length
                                ? outgoingEdges.sort((a, b) => b.stats.count - a.stats.count).map(edge => (
                                    <tr>
                                        <td>{edge.source.name}</td>
                                        <td>{edge.stats.count.toFixed(2)}</td>
                                        <td>{edge.stats.errorCount.toFixed(2)}</td>
                                    </tr>
                                  ))
                                : <tr><td>NA</td><td/><td/></tr>
                        }
                        </tbody>
                    </table>
                </section>
            </div>
        </article>
);

NodeDetails.defaultProps = {
    tags: {}
};

NodeDetails.propTypes =
    {
        incomingEdges: PropTypes.array.isRequired,
        outgoingEdges: PropTypes.array.isRequired,
        tags: PropTypes.object

    };
export default NodeDetails;

