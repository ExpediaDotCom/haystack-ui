/*
 * Copyright 2018 Expedia, Inc.
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

const linkBuilder = {};

linkBuilder.withAbsoluteUrl = relativeUrl => `${window.location.protocol}//${window.location.host}${relativeUrl}`;

linkBuilder.createTracesLink = ({serviceName, operationName, from, until, timePreset, traceId}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    if (traceId) {
        if (serviceName && operationName) {
            return `/service/${encodedServiceName}/traces?serviceName=${encodedServiceName}&operationName=${encodedOperationName}&traceId=${traceId}`;
        }

        if (serviceName) {
            return `/service/${encodedServiceName}/traces?serviceName=${encodedServiceName}&traceId=${traceId}`;
        }

        return `/service/${encodedServiceName}/traces?traceId=${traceId}`;
    }

    if (from && until) {
        return `/service/${encodedServiceName}/traces?operationName=${encodedOperationName}&startTime=${from}&endTime=${until}`;
    }

    if (timePreset) {
        return `/service/${encodedServiceName}/traces?operationName=${encodedOperationName}&timePreset=${timePreset}`;
    }

    return `/service/${encodedServiceName}/traces?operationName=${encodedOperationName}`;
};

linkBuilder.createTrendsLink = ({serviceName, operationName, from, until}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    if (from && until) {
        return `/service/${encodedServiceName}/trends?operationName=^${encodedOperationName}$&from=${from}&until=${until}`;
    }

    return `/service/${encodedServiceName}/trends?operationName=^${encodedOperationName}$`;
};

linkBuilder.createAlertsLink = ({serviceName, operationName, type}) => {
    const encodedServiceName = serviceName && encodeURIComponent(serviceName);
    const encodedOperationName = operationName && encodeURIComponent(operationName);

    return `/service/${encodedServiceName}/alerts?operationName=^${encodedOperationName}$&type=${type}`;
};

export default linkBuilder;
