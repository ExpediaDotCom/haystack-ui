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

const loggedInHome = '/';
const loginErrRedirect = '/login?error=true';
const IDENTIFIER_FORMAT = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified';
const EMAIL_ADDRESS_SCHEMA = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

module.exports = (redirectUrl) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        if (user.id && user.timestamp && user.timestamp > (Date.now() - config.sessionTimeout)) {
            done(null, user);
        } else {
            done('invalid user: timeout exceeded', null);
        }
    });

    passport.use(new SamlStrategy({
            callbackUrl: `${config.saml.callbackUrl}?redirectUrl=${redirectUrl || '/'}`,
            entryPoint: config.saml.entry_point,
            issuer: config.saml.issuer,
            acceptedClockSkewMs: -1,
            identifierFormat: IDENTIFIER_FORMAT
        },
        (profile, done) => done(null, {
            id: profile.nameID,
            email: profile[EMAIL_ADDRESS_SCHEMA],
            timestamp: Date.now()
        })
    ));

    return passport.authenticate('saml',
        {
            successRedirect: loggedInHome,
            failureRedirect: loginErrRedirect
        });
};

