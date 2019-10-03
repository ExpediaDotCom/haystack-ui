/* eslint-disable class-methods-use-this */
/*
 * Copyright 2019 Expedia Group
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

import store from '../../../serviceInsights/stores/serviceInsightsStore';

export class ServiceInsightsTabStateStore {
    search = null;
    isAvailable = false;
    hasValidSearch = false;

    init(search) {
        this.search = search;

        // is Service Insights enabled in the appliation config?
        const enableServiceInsights = (window.haystackUiConfig && window.haystackUiConfig.enableServiceInsights) || false;

        // If user is directly accessing URL, show this feature
        const isAccessingServiceInsights = this.search.tabId === 'serviceInsights';

        // has required minimal search terms
        this.hasValidSearch = !!(search.serviceName || search.traceId);

        this.isAvailable = enableServiceInsights && (this.hasValidSearch || isAccessingServiceInsights);
    }

    fetch() {
        // Copy `hasValidSearch` so serviceInsight reactJS component can leverage
        store.hasValidSearch = this.hasValidSearch;
        return store;
    }
}

export default new ServiceInsightsTabStateStore();
