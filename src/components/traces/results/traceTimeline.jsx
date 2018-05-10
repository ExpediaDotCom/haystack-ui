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
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import './traceTimeline.less';

@observer
export default class TraceTimeline extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        query: PropTypes.object.isRequired
    };

    componentDidMount() {
        console.log(this.props.query);
        const items = [];
        this.props.data.map(x => items.push(x));
        // const items = this.props.data;
        const options = {
            style: 'bar',
            barChart: {align: 'center', width: 180, minWidth: 1},
            drawPoints: false,
            start: this.props.query.startTime / 1000,
            end: this.props.query.endTime / 1000,
            height: '200px'
        };

        const container = this.graphContainer;
        // eslint-disable-next-line no-undef
        const data = new vis.DataSet(items);
        // eslint-disable-next-line no-undef
        const graph = new vis.Graph2d(container, data, options);
        graph.on('click', (prop) => {
            console.log(prop);
        });

        return graph;
    }

    render() {
        return (
            <div className="trace-timeline-container">
                <div ref={(node) => { this.graphContainer = node; }} style={{ height: '200px' }}/>
            </div>
        );
    }
}
