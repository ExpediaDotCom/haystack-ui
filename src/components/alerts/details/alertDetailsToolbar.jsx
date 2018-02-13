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
import {Link} from 'react-router-dom';
import Clipboard from 'react-copy-to-clipboard';

@observer
export default class AlertDetailsToolbar extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        operationName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            showCopied: false
        };
        this.handleCopy = this.handleCopy.bind(this);
    }

    handleCopy() {
        this.setState({showCopied: true});
        setTimeout(() => this.setState({showCopied: false}), 2000);
    }

    render() {
        return (
            <div>
                <div className="pull-left">
                    <Link to={`/service/${this.props.serviceName}/trends?operationName=${this.props.operationName}`} className="btn btn-primary">
                        <span className="ti-stats-up"/> Jump to Trends
                    </Link>
                </div>
                <div className="btn-group btn-group-sm pull-right">
                    <Link to={`/service/${this.props.serviceName}/traces?operationName=${this.props.operationName}`} className="btn btn-default">
                        <span className="ti-align-left"/> See Traces
                    </Link>
                    <Clipboard
                        text={`${window.location.protocol}//${window.location.host}/service/${this.props.serviceName}/alerts?operationName=${this.props.operationName}&type=${this.props.type}`}
                        onCopy={this.handleCopy}
                    >
                        <a role="button" className="btn btn-primary"><span className="ti-link"/> Share Alert</a>
                    </Clipboard>
                    {
                        this.state.showCopied && (
                            <span className="tooltip fade left in" role="tooltip">
                            <span className="tooltip-arrow"/>
                            <span className="tooltip-inner">Link Copied!</span>
                        </span>
                        )
                    }
                </div>
            </div>
        );
    }
}
