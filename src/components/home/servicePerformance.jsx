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
        history: PropTypes.object.isRequired,
        servicePerfStore: PropTypes.object.isRequired
    };

    static addTitle(servicePerfStats) {
        const serviceData = [];
        servicePerfStats.forEach((serviceObj) => {
            const obj = {...serviceObj};
            const successPercent = obj.successPercent === -100 ? 'NA' : `${Math.log(obj.successPercent).toFixed(2)}%`;
            obj.title =
                (<div>
                    <div className="rv-treemap__leaf__title">{obj.serviceName}</div>
                    <div className="rv-treemap__leaf__data">Success: {successPercent}</div>
                </div>);
            serviceData.push(obj);
        });
        return {children: serviceData};
    }

    constructor(props) {
        super(props);
        this.state = {
            area: 'totalCount',
            color: 'successPercent',
            hoveredNode: false
        };
        this.handleAreaParamChange = this.handleAreaParamChange.bind(this);
        this.handleColorParamChange = this.handleColorParamChange.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
    }

    handleAreaParamChange(event) {
        this.setState({area: event.value});
    }

    handleColorParamChange(event) {
        this.setState({color: event.value});
    }

    handleNodeClick() {
        this.props.history.push(`/service/${this.state.hoveredNode.data.serviceName}/trends`);
    }

    render() {
        const colorRange = ['#3f4d71', '#f2f4fb'];

        const areaOptions = [
            {value: 'failureCount', label: 'Failure Count'},
            {value: 'totalCount', label: 'Total Count'}
            ];

        const colorOptions = [
            {value: 'successPercent', label: 'Success Percent'}
        ];

        const ResponsiveTreemap = makeWidthFlexible(Treemap);

        return (
            <section className="container servicePerformance">
                <div className="servicePerformance__header clearfix">
                    <div className="servicePerformance__header-title pull-left">Service Performance</div>
                    <div className="pull-right clearfix">
                        <div className="servicePerformance__param-selector pull-left">
                            <div className="text-right">Area </div>
                            <Select
                                options={areaOptions}
                                onChange={this.handleAreaParamChange}
                                clearable={false}
                                value={this.state.area}
                            />
                        </div>
                        <div className="servicePerformance__param-selector pull-left">
                            <div className="text-right">Color </div>
                            <Select
                                options={colorOptions}
                                onChange={this.handleColorParamChange}
                                value={this.state.color}
                                clearable={false}
                            />
                        </div>
                    </div>
                </div>
                { this.props.servicePerfStore.promiseState && this.props.servicePerfStore.promiseState.case({
                    empty: () => <Loading />,
                    pending: () => <Loading />,
                    rejected: () => <Error />,
                    fulfilled: () => ((this.props.servicePerfStore.promiseState)
                        ? <ResponsiveTreemap
                            animation
                            height={600}
                            data={ServicePerformance.addTitle(this.props.servicePerfStore.servicePerfStats)}
                            renderMode={'DOM'}
                            padding={3}
                            margin={5}
                            mode={'squarify'}
                            colorType={'linear'}
                            colorRange={colorRange}
                            getSize={d => d[this.state.area]}
                            getColor={d => d[this.state.color]}
                            sortFunction={(a, b) => b.value - a.value}
                            onLeafMouseOver={nodeData => this.setState({hoveredNode: nodeData})}
                            onLeafMouseOut={() => this.setState({hoveredNode: false})}
                            onLeafClick={this.handleNodeClick}
                        />
                        : <Error />)
                })
                }
                <div className="pull-right">
                    <div className="text-right">Color Range </div>
                    <div className="servicePerformance__colorRangeIndicator" />
                </div>

            </section>
        );
    }
}
