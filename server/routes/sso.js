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
const passport = require('passport');

const router = express.Router();
// protected route
const loggedInHome = '/';
const loginErrRedirect = '/loginErr';
const winston = require('winston');

// Utilize Lo-Dash utility library
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ timestamp: true })
    ]
});

module.exports = () => {
    router.post('/saml/consume', passport.authenticate('saml',
        {
            failureRedirect: loginErrRedirect,
            failureFlash: true
        }),
        (req, res) => {
            logger.info(`action=authentication, status=success, redirectUrl=${loggedInHome}`);
            res.redirect(req.query.redirectUrl || loggedInHome);
        });
    return router;
};
