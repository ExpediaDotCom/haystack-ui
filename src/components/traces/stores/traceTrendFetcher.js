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
import Q from 'q';
import axios from 'axios';
import authenticationTimeoutStore from '../../../stores/authenticationTimeoutStore';

const fetcher = {};

function OperationTrendsException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

fetcher.fetchOperationTrends = (serviceName, operationName, from, until) => {
    const deferred = Q.defer();

    axios
        .get(`/api/trends/operation/${serviceName}/${encodeURIComponent(operationName)}?granularity=60000&from=${from}&until=${until}`)
        .then((result) => {
            deferred.resolve(result.data);
        })
        .catch((result) => {
            if (result.response.status === 401) {
                authenticationTimeoutStore.timedOut = true;
            }
            throw new OperationTrendsException(result);
        });

    return deferred.promise;
};

export default fetcher;
