/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

const server = require('../../server/app.js');
const request = require('supertest');

describe('Routes.api', () => {
    it('returns http 200 for /services', (done) => {
        request(server)
            .get('/api/services')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                return done();
            });
    });

    it('returns http 200 for /operations', (done) => {
        request(server)
            .get('/api/operations?serviceName=service')
            .expect(200)
            .end((err) => {
              if (err) {
                return done(err);
              }
              return done();
            });
    });

    it('returns http 200 for /traces', (done) => {
        request(server)
            .get('/api/traces')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                return done();
            });
    });

    it('returns http 200 for /trace', (done) => {
        request(server)
            .get('/api/trace/traceid')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                return done();
            });
    });
});
