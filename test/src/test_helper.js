/*
 * Copyright 2018 Expedia, Inc.
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

const { JSDOM } = require('jsdom');
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

const jsdom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
        .filter(prop => typeof target[prop] === 'undefined')
        .map(prop => Object.getOwnPropertyDescriptor(src, prop));
    Object.defineProperties(target, props);
}

// stubbing animation
window.cancelAnimationFrame = () => {};

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
global.window.haystackUiConfig = {
    subsystems: ['traces', 'trends', 'alerts'],
    tracesTimePresetOptions: ['5m', '15m', '1h', '4h', '12h', '24h', '3d'],
    timeWindowPresetOptions: [
        {shortName: '5m', longName: '5 minutes', value: 5 * 60 * 1000},
        {shortName: '15m', longName: '15 minutes', value: 15 * 60 * 1000},
        {shortName: '1h', longName: '1 hour', value: 60 * 60 * 1000},
        {shortName: '6h', longName: '6 hours', value: 6 * 60 * 60 * 1000},
        {shortName: '12h', longName: '12 hours', value: 12 * 60 * 60 * 1000},
        {shortName: '24h', longName: '24 hours', value: 24 * 60 * 60 * 1000},
        {shortName: '3d', longName: '3 days', value: 3 * 24 * 60 * 60 * 1000},
        {shortName: '7d', longName: '7 days', value: 7 * 24 * 60 * 60 * 1000},
        {shortName: '30d', longName: '30 days', value: 30 * 24 * 60 * 60 * 1000}
    ],
    relatedTracesOptions: [
        {
            fieldTag: 'success',
            propertyToMatch: 'success',
            fieldDescription: 'success status'
        }
    ],
    tracesTTL: -1,
    trendsTTL: -1
};
global.window.haystackUiConfig.enableAlertSubscriptions = true;
copyProps(window, global);
