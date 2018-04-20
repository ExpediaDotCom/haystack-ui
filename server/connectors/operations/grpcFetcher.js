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

const Q = require('q');
const errorConverter = require('../utils/errorConverter');
const logger = require('../../utils/logger').withIdentifier('fetcher.grpc');
const metrics = require('../../utils/metrics');

const grpc = require('grpc');

const config = require('../../config/config');
const services = require('../../../static_codegen/traceReader_grpc_pb');

const grpcOptions = {
    'grpc.max_receive_message_length': 10485760,
    ...config.connectors.traces.grpcOptions
};

const client = new services.TraceReaderClient(
    `${config.connectors.traces.haystackHost}:${config.connectors.traces.haystackPort}`,
    grpc.credentials.createInsecure(),
    grpcOptions); // TODO make client secure

function generateCallDeadline() {
    return new Date().setMilliseconds(new Date().getMilliseconds() + config.upstreamTimeout);
}

const fetcher = fetcherName => ({
    fetch: (request) => {
        const deferred = Q.defer();
        const timer = metrics.timer(`fetcher_grpc_${fetcherName}`).start();

        client[fetcherName](request,
            {deadline: generateCallDeadline()},
            (error, result) => {
                timer.end();
                if (error || !result) {
                    logger.info(`fetch failed: ${fetcherName}`);
                    metrics.meter(`fetcher_grpc_failure_${fetcherName}`).mark();

                    deferred.reject(errorConverter.fromGrpcError(error));
                } else {
                    logger.info(`fetch successful: ${fetcherName}`);

                    deferred.resolve(result);
                }
            });

        return deferred.promise;
    }
});

module.exports = fetcher;
