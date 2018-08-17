/*
 * Copyright 2018 Expedia Group
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
import { convertSearchToUrlQuery } from '../components/universalSearch/utils/urlUtils';

const linkBuilder = {};

linkBuilder.withAbsoluteUrl = relativeUrl => `${window.location.protocol}//${window.location.host}${relativeUrl}`;

linkBuilder.universalSearchLink = search => `/search?${convertSearchToUrlQuery(search)}`;

linkBuilder.universalSearchTracesLink = search => `/search?${convertSearchToUrlQuery(search)}&tabId=traces`;

linkBuilder.universalSearchTrendsLink = search => `/search?${convertSearchToUrlQuery(search)}&tabId=trends`;

linkBuilder.universalSearchAlertsLink = search => `/search?${convertSearchToUrlQuery(search)}&tabId=alerts`;

linkBuilder.universalSearchServiceGraphLink = search => `/search?${convertSearchToUrlQuery(search)}&tabId=serviceGraph`;

linkBuilder.createTracesLink = ({serviceName, operationName, from, until, timePreset, traceId}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    if (traceId) {
        if (serviceName && operationName) {
            return `/legacy/service/${encodedServiceName}/traces?serviceName=${encodedServiceName}&operationName=${encodedOperationName}&traceId=${traceId}`;
        }

        if (serviceName) {
            return `/legacy/service/${encodedServiceName}/traces?serviceName=${encodedServiceName}&traceId=${traceId}`;
        }

        return `/legacy/service/${encodedServiceName}/traces?traceId=${traceId}`;
    }

    if (from && until) {
        return `/legacy/service/${encodedServiceName}/traces?operationName=${encodedOperationName}&startTime=${from}&endTime=${until}`;
    }

    if (timePreset) {
        return `/legacy/service/${encodedServiceName}/traces?operationName=${encodedOperationName}&timePreset=${timePreset}`;
    }

    if (operationName) {
        return `/legacy/service/${encodedServiceName}/traces?operationName=${encodedOperationName}`;
    }

    return `/legacy/service/${encodedServiceName}/traces`;
};

linkBuilder.createTrendsLink = ({serviceName, operationName, from, until}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    if (from && until) {
        return `/legacy/service/${encodedServiceName}/trends?operationName=^${encodedOperationName}$&from=${from}&until=${until}`;
    }

    return `/legacy/service/${encodedServiceName}/trends?operationName=^${encodedOperationName}$`;
};

linkBuilder.createAlertsLink = ({serviceName, operationName, type}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    return `/legacy/service/${encodedServiceName}/alerts?operationName=^${encodedOperationName}$&type=${type}`;
};

export default linkBuilder;
