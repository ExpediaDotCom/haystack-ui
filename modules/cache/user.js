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

const cache = require('memory-cache');

const User = {
    findById: (id, callback) => {
        callback(null, cache.get(id));
    },

    findOrCreate: (details, callback) => {
        if (!details.id) {
            callback('User details did not have an "id" specified', null);
            return;
        }
        let user = cache.get(details.id);
        if (!user) {
            user = {
                id: details.id,
                userName: details.userName,
                userGroups: details.userGroups,
                email: details.email
            };
            cache.put(details.id, user);
        }
        callback(null, user);
    }
};

module.exports = User;
