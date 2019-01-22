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

const requestBuilder = {};
const messages = require('../../../../static_codegen/subscription/subscriptionManagement_pb');

function createSubscriptionOperands(subscription) {
    const expressionTree = subscription.expressionTree;

    return Object.keys(expressionTree).map((key) => {
        const op = new messages.Operand();

        const field = new messages.Field();
        field.setName(key);
        field.setValue(expressionTree[key]);

        op.setField(field);

        return op;
    });
}

requestBuilder.createSubscriptionExpressionTree = (subscription) => {
    const expressionTree = new messages.ExpressionTree();
    expressionTree.setOperator(messages.ExpressionTree.Operator.AND);

    const subscriptionOperands = createSubscriptionOperands(subscription);

    expressionTree.setOperandsList([...subscriptionOperands]);

    return expressionTree;
};

module.exports = requestBuilder;
