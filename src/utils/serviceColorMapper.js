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
/* eslint-disable no-bitwise */

const colorMapper = {};

// calculate hash code for a given string
function calculateHash(svc) {
  return svc.split('').reduce((a, b) => {
    let running = a;
    running = ((running << 5) - running) + b.charCodeAt(0);
    return running & running;
  }, 0);
}

function mapToColorIndex(svc) {
  return (Math.abs(calculateHash(svc)) % 25) + 1;
}

colorMapper.toFillClass = serviceName => `svc-color-${mapToColorIndex(serviceName)}-fill`;

colorMapper.toBackgroundClass = serviceName => `svc-color-${mapToColorIndex(serviceName)}-bg`;

export default colorMapper;
