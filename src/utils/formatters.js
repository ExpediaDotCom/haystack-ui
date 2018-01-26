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

import timeago from 'timeago.js';
import moment from 'moment';

const formatters = {};

formatters.toTimestring = startTime => moment(Math.floor(startTime / 1000)).format('kk:mm:ss, DD MMM YY');

formatters.toTimestringWithMs = startTime => moment(Math.floor(startTime / 1000)).format('kk:mm:ss.SSS, DD MMM YY');

formatters.toTimeago = startTime => timeago().format(Math.floor(startTime / 1000));

formatters.toDurationMsString = duration => `${Math.floor(duration / 1000)}ms`;

formatters.toDurationString = (duration) => {
    if (duration === 0) {
        return '0';
    } else if (duration < 1000000) {
        return `${Math.floor(duration / 1000)}ms`;
    }
    return `${(duration / 1000000).toFixed(3)}s`;
};

formatters.toDurationStringInSecAndMin = (duration) => {
    if (duration === 0) {
        return '0';
    } else if (duration < 60000000) {
        return `${Math.floor(duration / 1000000)} sec`;
    }
    return `${Math.floor(duration / 60000000)} min`;
};

formatters.toDurationStringFromMs = (duration) => {
    if (duration === 0) {
        return '0ms';
    } else if (duration < 1000) {
        return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed()}s`;
};

formatters.toNumberString = (num) => {
    if (num === 0) {
        return '0';
    } else if (num < 1000) {
        return `${num}`;
    } else if (num < 1000000) {
        return `${(num / 1000).toFixed(1)}k`;
    }
    return `${(num / 1000000).toFixed(1)}m`;
};

formatters.toTimeRangeString = (fromInMs, untilInMs) => {
    const start = moment(fromInMs);
    const end = moment(untilInMs);

    return `${start.format('L')} ${start.format('LT')} - ${end.format('L')} ${end.format('LT')}`;
};

export default formatters;
