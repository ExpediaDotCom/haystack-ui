/*
 * Copyright 2017 Expedia, Inc.
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
global.window.haystackUiConfig = { subsystems: ['traces', 'trends'], fieldKeys: ['traceId', 'spanId', 'serviceName', 'operationName', 'error'] };

copyProps(window, global);
