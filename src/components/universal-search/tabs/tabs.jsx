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
import {observer} from 'mobx-react';
import TraceResults from '../../traces/results/traceResults';
import tracesSearchStore from '../../traces/stores/tracesSearchStore';
import ServiceGraph from '../../serviceGraph/serviceGraph';

@observer
export default class Tabs extends React.Component {
    static tabs = [
        {
            tabId: 'traces',
            displayName: 'Traces',
            icon: 'ti-align-left'
        },
        {
            tabId: 'trends',
            displayName: 'Trends',
            icon: 'ti-stats-up'
        },
        {
            tabId: 'alerts',
            displayName: 'Alerts',
            icon: 'ti-bell'
        },
        {
            tabId: 'serviceGraph',
            displayName: 'Service Graph',
            icon: 'ti-vector'
        },
        {
            tabId: 'servicePerformance',
            displayName: 'Service Performance',
            icon: 'ti-pie-chart'
        }
    ];

    static createTabsList(query) {
        if (query.serviceName) {
            if (Object.keys(query).length === 1 || (query.operationName && Object.keys(query).length === 1))
                return Tabs.tabs.filter(tab => tab.tabId === 'traces' || tab.tabId === 'trends' || tab.tabId === 'alerts');
            else
                return Tabs.tabs.filter(tab => tab.tabId === 'traces');
        }
        return Tabs.tabs.filter(tab => tab.tabId === 'traces');
    }

    static TabViewer({tabId}) {
        switch (tabId) {
            case 'traces':
                return <TraceResults tracesSearchStore={tracesSearchStore} history={history} location={location}/>;
            case 'trends':
                return <div>{tabId}</div>;
            case 'serviceGraph':
                return <article className="container"><ServiceGraph /></article>;
            default:
                return <div>{tabId}</div>;
        }
    }

    constructor() {
        super();

        this.state = {};
        this.selectTab = this.selectTab.bind(this);
    }

    componentWillReceiveProps() {
        this.setState({selectedTabId: null});
    }

    selectTab(tabId) {
        this.setState({selectedTabId: tabId});
    }

    render() {
        const tabsList = Tabs.createTabsList(tracesSearchStore.searchQuery, tracesSearchStore.queryString);
        const selectedTabId = this.state.selectedTabId || tabsList[0].tabId;

        return (
            <article>
                <section className="container">
                    <nav>
                        <ul className="nav nav-tabs">
                            {
                                tabsList.map(tab =>
                                    (<li className={tab.tabId === selectedTabId ? 'active' : ''}>
                                        <a role="button" className="universal-search-bar-tabs__nav-text" tabIndex="-1" onClick={() => this.selectTab(tab.tabId)}>
                                            <span className={`serviceToolsTab__tab-option-icon ${tab.icon}`}/>
                                            <span>{tab.displayName}</span>
                                        </a>
                                    </li>)
                                )
                            }
                        </ul>
                    </nav>
                </section>
                <section className="universal-search-tab__content">
                    <div className="container">
                        <Tabs.TabViewer tabId={selectedTabId} />
                    </div>
                </section>
            </article>
        );
    }
}
