/*

 *  Copyright 2018 Expedia Group
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

const _ = require('lodash');
const baseConfiguration = require('../config/base');

if (process.env.HAYSTACK_OVERRIDES_CONFIG_PATH) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  let overridesConfiguration = process.env.HAYSTACK_OVERRIDES_CONFIG_PATH;
  if (!overridesConfiguration.startsWith('/')) {
    overridesConfiguration = `${process.cwd()}/${overridesConfiguration}`;
  }
  const environmentSpecificConfiguration = require(overridesConfiguration);
  module.exports = _.extend({}, baseConfiguration, environmentSpecificConfiguration);
}
else {
  module.exports = baseConfiguration;
}
