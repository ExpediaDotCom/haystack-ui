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

const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const User = require('../cache/user');

const loggedInHome = '/';
const loginErrRedirect = '/loginErr';

module.exports = (options, cb) => {
    const serializeUser = (user, done) => {
        done(null, user.id);
    };

    const deserializeUser = (id, done) => {
        User.findById(id, done);
    };

    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
    passport.use(new SamlStrategy(options, cb));

    return passport.authenticate('saml',
        {
            successRedirect: loggedInHome,
            failureRedirect: loginErrRedirect
        });
};
