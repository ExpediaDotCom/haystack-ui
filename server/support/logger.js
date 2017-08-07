/*

  *  Copyright 2017 Expedia, Inc.
  *
  *     Licensed under the Apache License, Version 2.0 (the "License");
  *     you may not use this file except in compliance with the License.
  *     You may obtain a copy of the License at
  *
  *         http://www.apache.org/licenses/LICENSE-2.0
  *
  *     Unless required by applicable law or agreed to in writing, software
  *     distributed under the License is distributed on an "AS IS" BASIS,
  *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  *     See the License for the specific language governing permissions and
  *     limitations under the License.
  *

 */

const fs = require('fs');
const isDev = require('isdev');
const winston = require('winston');
const expressWinston = require('express-winston');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/config');

const LOG_FOLDER = `${__dirname}/../../logs`;
if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER);
}

const ACCESS_LOG_LOCATION = `${LOG_FOLDER}/access.log`;
const APPLICATION_LOG_LOCATION = `${LOG_FOLDER}/log.txt`;
const ERROR_LOG_LOCATION = `${LOG_FOLDER}/${config.appName}.txt`;

const BASE_TRANSPORT_OPTIONS = {
    json: false,
    colorize: isDev
};
const CONSOLE_TRANSPORT_OPTIONS = _.merge({}, BASE_TRANSPORT_OPTIONS);
const FILE_TRANSPORT_OPTIONS = _.merge({}, BASE_TRANSPORT_OPTIONS, {
    maxFiles: config.accessLog.keep,
    maxSize: config.accessLog.fileSize,
    zippedArchive: config.accessLog.compress,
    tailable: true
});

function getLogFormatterOptionsWithIdentifier(identifier) {
    return {
        timestamp: () => Date.now(),
        formatter: (options) => {
            const level = options.level || 'unknown';
            const meta = _.isEmpty(options.meta) ? '' : JSON.stringify(options.meta);
            return `${moment.utc(options.timestamp()).format()}: identifier="${identifier}" level="${level.toUpperCase()}" message="${options.message}" ${meta}`;
        }
    };
}

exports.withIdentifier = (identifier) => {
    if (!identifier) {
        throw new Error('Identifier is required while setting up a logger. For example, pass the module name that will use this logger.');
    }
    return new winston.Logger({
        transports: [
            isDev ?
                new winston.transports.Console(_.merge({}, CONSOLE_TRANSPORT_OPTIONS, getLogFormatterOptionsWithIdentifier(identifier))) :
                new winston.transports.File(_.merge({}, FILE_TRANSPORT_OPTIONS, getLogFormatterOptionsWithIdentifier(identifier), {filename: APPLICATION_LOG_LOCATION}))
    ]
    });
};

exports.REQUEST_LOGGER = expressWinston.logger({
    transports: [
        isDev ?
            new winston.transports.Console(CONSOLE_TRANSPORT_OPTIONS) :
            new winston.transports.File(_.merge({}, FILE_TRANSPORT_OPTIONS, {filename: ACCESS_LOG_LOCATION}))
    ],
    colorize: isDev
});

exports.ERROR_LOGGER = expressWinston.errorLogger({
    transports: [
        isDev ?
            new winston.transports.Console(CONSOLE_TRANSPORT_OPTIONS) :
        new winston.transports.File(_.merge({}, FILE_TRANSPORT_OPTIONS, {filename: ERROR_LOG_LOCATION}))
    ]
});
