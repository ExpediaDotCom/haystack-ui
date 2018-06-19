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
import PropTypes from 'prop-types';

import EmptyTab from './emptyTabPlaceholder';
import TraceResults from '../../traces/results/traceResults';
import tracesSearchStore from '../../traces/stores/tracesSearchStore';
import ServiceGraph from '../../serviceGraph/serviceGraph';
import OperationResults from '../../trends/operation/operationResults';
import operationStore from '../../trends/stores/operationStore';
import tracesTabState from './tabStores/tracesTabStateStore';
import trendsTabState from './tabStores/trendsTabStateStore';
import alertsTabState from './tabStores/alertsTabStateStore';

@observer
export default class Tabs extends React.Component {
    static propTypes = {
        search: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    static tabs = [
        {
            tabId: 'traces',
            displayName: 'Traces',
            icon: 'ti-align-left',
            store: tracesTabState
        },
        {
            tabId: 'trends',
            displayName: 'Trends',
            icon: 'ti-stats-up',
            store: trendsTabState
        },
        {
            tabId: 'alerts',
            displayName: 'Alerts',
            icon: 'ti-bell',
            store: alertsTabState
        }
        // {
        //     tabId: 'serviceGraph',
        //     displayName: 'Service Graph',
        //     icon: 'ti-vector',
        //     store: null
        // },
        // {
        //     tabId: 'servicePerformance',
        //     displayName: 'Service Performance',
        //     icon: 'ti-pie-chart',
        //     store: null
        // }
    ];

    static TabViewer({tabId}) {
        // trigger fetch request on store for the tab
        // TODO getting a nested store used by original non-usb components, cleanup it up
        Tabs.tabs.find(tab => tab.tabId === tabId).store.fetch();

        switch (tabId) {
            case 'traces':
                return <TraceResults tracesSearchStore={tracesSearchStore} history={history} location={location}/>;
            case 'trends':
                return <OperationResults operationStore={operationStore} history={history} location={location}/>;
            default:
                return <h5>Coming soon - {tabId}</h5>;
        }
    }

    constructor(props) {
        super(props);

        // state initialization
        this.state = {};

        // bindings
        this.selectTab = this.selectTab.bind(this);

        // init state stores for tabs
        Tabs.tabs.forEach(tab => tab.store && tab.store.init(props.search));
    }

    componentWillReceiveProps(nextProps) {
        this.setState({selectedTabId: null});
        Tabs.tabs.forEach(tab => tab.store.init(nextProps.search));
    }

    selectTab(tabId) {
        this.setState({selectedTabId: tabId});
    }

    render() {
        const selectedTabId = this.state.selectedTabId || Tabs.tabs[0].tabId; // pick traces as default
        const noTabAvailable = !Tabs.tabs.some(t => t.store.isAvailable);

        // tab selectors for navigation between tabs
        const TabSelector = tab => (tab.store.isAvailable ?
            (
                <li className={tab.tabId === selectedTabId ? 'active' : ''}>
                    <a role="button" className="universal-search-bar-tabs__nav-text" tabIndex="-1" onClick={() => this.selectTab(tab.tabId)}>
                            <span className={`serviceToolsTab__tab-option-icon ${tab.icon}`}/>
                        <span>{tab.displayName}</span>
                    </a>
                </li>
            )
            : null);

        const TabsContainer = () => (
            <article>
                <section className="container">
                    <nav>
                        <ul className="nav nav-tabs">{ Tabs.tabs.map(tab => TabSelector(tab)) }</ul>
                    </nav>
                </section>
                <section className="universal-search-tab__content">
                    <div className="container">
                        <Tabs.TabViewer tabId={selectedTabId} />
                    </div>
                </section>
            </article>
        );

        return noTabAvailable ? <EmptyTab/> : <TabsContainer/>;
    }
}
