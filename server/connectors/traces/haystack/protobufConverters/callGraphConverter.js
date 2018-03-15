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
const transformer = {};

function toCallNode(pbNode) {
    return {
        serviceName: pbNode.servicename,
        operationName: pbNode.operationname,
        infrastructureProvider: pbNode.infrastructureprovider,
        infrastructureLocation: pbNode.infrastructurelocation
    };
}

transformer.transform = pbCallGraph =>
    pbCallGraph.callsList.map(call => ({
        networkDelta: call.networkdelta,
        from: toCallNode(call.from),
        to: toCallNode(call.to)
    }));

module.exports = transformer;
