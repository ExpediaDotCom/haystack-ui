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

import moment from 'moment';
import metricGranularity from '../components/trends/utils/metricGranularity';
import formatters from './formatters';

const timeWindow = {};

timeWindow.presets = [
    {
        shortName: '5m',
        longName: '5 minutes',
        value: 5 * 60 * 1000
    },
    {
        shortName: '15m',
        longName: '15 minutes',
        value: 15 * 60 * 1000
    },
    {
        shortName: '1h',
        longName: '1 hour',
        value: 60 * 60 * 1000
    },
    {
        shortName: '6h',
        longName: '6 hours',
        value: 6 * 60 * 60 * 1000
    },
    {
        shortName: '12h',
        longName: '12 hours',
        value: 12 * 60 * 60 * 1000
    },
    {
        shortName: '24h',
        longName: '24 hours',
        value: 24 * 60 * 60 * 1000
    },
    {
        shortName: '3d',
        longName: '3 days',
        value: 3 * 24 * 60 * 60 * 1000
    },
    {
        shortName: '7d',
        longName: '7 days',
        value: 7 * 24 * 60 * 60 * 1000
    },
    {
        shortName: '30d',
        longName: '30 days',
        value: 30 * 24 * 60 * 60 * 1000
    }
];

timeWindow.defaultPreset = timeWindow.presets[1];

timeWindow.toTimeRange = (ms) => {
    const nowInMilliseconds = new Date().getTime();
    return {
        from: moment(nowInMilliseconds).subtract(ms, 'milliseconds').valueOf(),
        until: nowInMilliseconds
    };
};

timeWindow.findMatchingPreset = value => timeWindow.presets.find(preset => preset.value === value);

timeWindow.findMatchingPresetByShortName = shortName => timeWindow.presets.find(preset => preset.shortName === shortName);

timeWindow.toCustomTimeRange = (from, until) => ({
    from,
    until,
    value: until - from,
    longName: formatters.toTimeRangeString(from, until),
    isCustomTimeRange: true
});

timeWindow.getLowerGranularity = (timeInMs) => {
    const maxNumberOfPoints = 100;
    return metricGranularity.getMinGranularity(timeInMs / maxNumberOfPoints);
};

timeWindow.getHigherGranularity = (timeInMs) => {
    const maxNumberOfPoints = 15;
    return metricGranularity.getMaxGranularity(timeInMs / maxNumberOfPoints);
};

export default timeWindow;
