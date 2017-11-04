/*
 * Copyright 2017 Expedia, Inc.
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

import moment from 'moment';
import metricGranularity from './metricGranularity';
import formatters from '../../../utils/formatters';

const timeWindow = {};

const nowInMilliseconds = new Date().getTime();

timeWindow.presets = [
    {
        id: '5m',
        shortName: '5m',
        longName: '5 minutes',
        value: 5 * 60 * 1000,
        from: moment().subtract(5, 'm').valueOf(),
        until: nowInMilliseconds
    },
    {
        id: '1h',
        shortName: '1h',
        longName: '1 hour',
        value: 60 * 60 * 1000,
        from: moment().subtract(1, 'h').valueOf(),
        until: nowInMilliseconds
    },
    {
        id: '6h',
        shortName: '6h',
        longName: '6 hours',
        value: 6 * 60 * 60 * 1000,
        from: moment().subtract(6, 'h').valueOf(),
        until: nowInMilliseconds
    },
    {
        id: '12h',
        shortName: '12h',
        longName: '12 hours',
        value: 12 * 60 * 60 * 1000,
        from: moment().subtract(12, 'h').valueOf(),
        until: nowInMilliseconds
    },
    {
        id: '24h',
        shortName: '24h',
        longName: '24 hours',
        value: 24 * 60 * 60 * 1000,
        from: moment().subtract(24, 'h').valueOf(),
        until: nowInMilliseconds
    },
    {
        id: '7d',
        shortName: '7d',
        longName: '7 days',
        value: 7 * 24 * 60 * 60 * 1000,
        from: moment().subtract(7, 'd').valueOf(),
        until: nowInMilliseconds
    }
];

timeWindow.toTimeRange = ms => ({
    from: moment().subtract(ms, 'milliseconds').valueOf(),
    until: moment().valueOf()
});

timeWindow.findMatchingPreset = value => timeWindow.presets.find(preset => preset.value === value);

timeWindow.toCustomTimeRange = (from, until) => ({
    from,
    until,
    value: until - from,
    text: formatters.toTimeRangeString(from, until)
});

timeWindow.getLowerGranularity = (timeInMs) => {
    const maxNumberOfPoints = 100;
    return metricGranularity.getMinGranularity(timeInMs / maxNumberOfPoints);
};

timeWindow.getHigherGranularity = (timeInMs) => {
    const minNumberOfPoints = 4;
    return metricGranularity.getMinGranularity(timeInMs / minNumberOfPoints);
};

export default timeWindow;
