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
const config = require('../config/config');

const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const User = require('./user');

const loggedInHome = '/';
const loginErrRedirect = '/login?error=true';
const identifierFormat = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, done);
});

passport.use(new SamlStrategy({
    path: '/sso/saml/consume?redirectUrl=/',
    entryPoint: config.passport.entry_point,
    issuer: config.passport.issuer,
    acceptedClockSkewMs: -1,
    identifierFormat
}, (profile, done) => {
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
}));

module.exports = passport.authenticate('saml',
    {
        successRedirect: loggedInHome,
        failureRedirect: loginErrRedirect
    });
