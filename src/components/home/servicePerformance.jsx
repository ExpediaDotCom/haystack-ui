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

import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Treemap, makeWidthFlexible} from 'react-vis';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Error from '../common/error';
import Loading from '../common/loading';
import './servicePerformance.less';

@observer
export default class ServicePerformance extends Component {
    static propTypes = {
        serviceStore: PropTypes.object.isRequired
    };

    static addStyle(servicePerfStats) {
        const serviceData = [];
        servicePerfStats.forEach((serviceObj) => {
            const obj = Object.assign({}, serviceObj);
            obj.style = {fontSize: '13px', textAnchor: 'start', fill: '#f2f4fb', transform: 'translate(10)'};
            serviceData.push(obj);
        });
        return {children: serviceData};
    }

    constructor(props) {
        super(props);
        this.state = {
            area: 'totalCount',
            color: 'successPercent'
        };
        this.handleAreaParamChange = this.handleAreaParamChange.bind(this);
        this.handleColorParamChange = this.handleColorParamChange.bind(this);
    }

    handleAreaParamChange(event) {
        this.setState({area: event.value});
    }

    handleColorParamChange(event) {
        this.setState({color: event.value});
    }

    render() {
        const colorRange = ['#3b5998', '#8b9dc3', '#dfe3ee', '#f7f7f7', '#ffffff'];

        const areaOptions = [
            {value: 'failureCount', label: 'Failure Count'},
            {value: 'totalCount', label: 'Total Count'}
            ];

        const colorOptions = [
            {value: 'successPercent', label: 'Success Percent'}
        ];

        const treemapStyleSVG = {
            stroke: 'none',
            textAnchor: 'start'
        };

        const ResponsiveTreemap = makeWidthFlexible(Treemap);

        return (
            <section className="container servicePerformance">
                <div className="servicePerformance__header">
                    <div className="servicePerformance__header-title">Service Performance</div>
                    <div className="servicePerformance__header-params">
                        <div className="servicePerformance__param-selector pull-right">
                            <div className="pull-right">Area </div>
                            <Select
                                options={areaOptions}
                                onChange={this.handleAreaParamChange}
                                clearable={false}
                                value={this.state.area}
                                placeholder=""
                            />
                        </div>
                        <div className="servicePerformance__param-selector pull-right">
                            <div className="pull-right">Color </div>
                            <Select
                                options={colorOptions}
                                onChange={this.handleColorParamChange}
                                value={this.state.color}
                                clearable={false}
                                placeholder=""
                            />
                        </div>
                    </div>
                </div>
                { this.props.serviceStore.promiseState && this.props.serviceStore.promiseState.case({
                    empty: () => <Loading />,
                    pending: () => <Loading />,
                    rejected: () => <Error />,
                    fulfilled: () => ((this.props.serviceStore.promiseState)
                        ? <ResponsiveTreemap
                            animation
                            height={500}
                            data={ServicePerformance.addStyle(this.props.serviceStore.servicePerfStats)}
                            style={treemapStyleSVG}
                            renderMode={'SVG'}
                            padding={3}
                            margin={5}
                            mode={'squarify'}
                            colorType={'linear'}
                            colorRange={colorRange}
                            getSize={d => d[this.state.area]}
                            getColor={d => d[this.state.color]}
                            sortFunction={(a, b) => b.value - a.value}
                        />
                        : <Error />)
                })
                }
            </section>
        );
    }
}
