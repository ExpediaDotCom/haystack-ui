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

const express = require('express');
const User = require('../../modules/cache/user');

const router = express.Router();
const loggedOutHome = '/login';
const passportInstance = require('../../modules/passport/passportInstance');

module.exports = (config) => {
    const extractClaims = (profile, done) => {
        done(null, User.findOrCreate({
            id: profile.nameID,
            userName: profile[config.passport.given_name_schema],
            userGroups: profile[config.passport.user_group_schema],
            email: profile[config.passport.email_address_schema]
        }, (err, user) => {
            if (err) {
                return done(err);
            }
            return done(null, user);
        }));
    };

    const getAuthenticate = (req) => {
        const options = {
            callbackUrl: `${config.passport.callback}?redirectUrl=${req.query.redirectUrl}`,
            entryPoint: config.passport.entry_point,
            issuer: config.passport.issuer,
            acceptedClockSkewMs: -1,
            identifierFormat: config.passport.identifier_format
        };
        return passportInstance(options, extractClaims);
    };

    router.get('/login', (req, res, next) => {
        getAuthenticate(req)(req, res, next);
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect(loggedOutHome);
    });

    return router;
};
