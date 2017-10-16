/*
 * Copyright 2017 Expedia, Inc.
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
import moment from 'moment';

import './trendsHeader.less';

export default class TrendsHeader extends React.Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.fetchTrends = this.fetchTrends.bind(this);
        this.fetchTrends();
    }


    fetchTrends() {
        const query = {
            granularity: 3600,
            from: moment(new Date()).subtract(3600, 'seconds').valueOf(),
            until: moment(new Date()).valueOf()
        };
        this.props.store.fetchTrendServiceResults(this.props.serviceName, query);
    }

    render() {
        return (<div className="clearfix">
                <div className="pull-right">
                    <span>Showing summary for last </span>
                    <select className="trend-summary__time-range-selector" value="1h">
                        <option value="1h">1 hour</option>
                    </select>
                </div>
            </div>
        );
    }
}
