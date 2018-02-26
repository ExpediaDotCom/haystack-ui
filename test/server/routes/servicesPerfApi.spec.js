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

const server = require('../../../server/app.js');
const request = require('supertest');

describe('routes.servicePerfApi', () => {
    it('returns http 200 for /api/servicePerf', (done) => {
        request(server)
            .get('/api/servicePerf')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                return done();
            });
    });
});
