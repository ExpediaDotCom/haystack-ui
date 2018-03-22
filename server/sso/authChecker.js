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

/**
 * Middleware to allow requests from only logged-in users
 * @param req The request object
 * @param res The response object
 * @param next The next middleware/handler in the chain
*/

module.exports = function (config) {
    return function (req, res, next) {
        if (req.user || !config.enableSSO) {
            next();
        } else {
            res.status(401).end();
        }
    };
};
