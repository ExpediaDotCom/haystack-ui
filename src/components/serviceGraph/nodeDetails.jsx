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
                    <div>
                        <span className="h4">Tags</span>
                    </div>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            Object.keys(tags).map(tagKey => (
                                <tr>
                                    <td>{tagKey}</td>
                                    <td>{tags[tagKey]}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </section>
                <section className="col-md-4">
                    <div>
                        <span className="h4">Incoming Traffic</span> <span>(1 hour average)</span>
                    </div>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>service</th>
                            <th>Rq/sec</th>
                            <th>Errors/sec</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            incomingEdges.map(edge => (
                                <tr>
                                    <td>{edge.source.name}</td>
                                    <td>{edge.stats.count.toFixed(2)}</td>
                                    <td>{edge.stats.errorCount.toFixed(2)}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </section>
                <section className="col-md-4">
                    <div>
                        <span className="h4">Outgoing Traffic</span> <span>(1 hour average)</span>
                    </div>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>service</th>
                            <th>Rq/sec</th>
                            <th>Errors/sec</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            outgoingEdges.map(edge => (
                                <tr>
                                    <td>{edge.source.name}</td>
                                    <td>{edge.stats.count.toFixed(2)}</td>
                                    <td>{edge.stats.errorCount.toFixed(2)}</td>
                                </tr>
                            ))
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

