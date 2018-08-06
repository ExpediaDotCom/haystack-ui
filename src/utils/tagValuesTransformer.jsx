/*
 * Copyright 2018 Expedia Group
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
/* eslint-disable no-unused-vars */

import React from 'react';
import validUrl from './validUrl';
import { map } from '../../node_modules/mobx';

/**
 * The following transform functions take the tag object (from the span data) and
 * transform configuration (from haystackUiConfig) as input and return jsx as output.
 */

/**
 * Default Transform:
 * 
 * Returns either a hyperlink of the tag value or just a normal tag value in a <span>,
 * depending on whether the value is a valid url.
 */
function defaultTransform(tag, transform) {
    const value = tag.value;
    return validUrl.isUrl(value) ?
        (<a href={value} target="_blank">
            <span className="ti-new-window"/> <span>{value}</span>
        </a>) :
        (<span>{`${value}`}</span>);
}

/**
 * Returns either a hyperlink where the url is the pattern with '!{temp}'
 * is replaced with the tag value.
 */
function linkTransform(tag, transform) {
    const value = tag.value;
    const link = transform.urlTemplate.replace('#{value}', value);
    const text = transform.textTemplate ? transform.textTemplate.replace('#{value}', value) : value;
    
    return (<a href={link} target="_blank">
        <span className="ti-new-window"/> <span>{text}</span>
    </a>);
}

/**
 * Returns either a green check success icon or a red x error icon depending on whether
 * the value is 'true' or 'false'.
 */
function booleanTransform(tag, transform) {
    const status = (tag.value === 'true') ? 'success' : 'error';
    return <img src={`/images/${status}.svg`} alt={status} height="20" width="20" />;
}

const transformMap = (window.haystackUiConfig && window.haystackUiConfig.tagValuesTransformMap);

/**
 * By default, the default transform function is exported.
 */
let transformFunction = tag => defaultTransform(tag); // eslint-disable-line import/no-mutable-exports

/**
 * If tagValuesTransformMap is configured in the base.js configuration file, then we will export the
 * transform function that takes advantage of that
 */
if (transformMap) {
    transformFunction = function valueTransform(tag) {
        // Check if specific tag is configured
        if (transformMap[tag.key]) {
            // Parse the configuration
            const transform = transformMap[tag.key];
            // Return different transformation according to transform type
            switch (transform.type) {
                case 'boolean':
                    return booleanTransform(tag);
                case 'link':
                    return linkTransform(tag, transform);
                default:
            }
        }
        /**
         * If specific tag is not configured or the transform type isn't account for,
         * return default transformation
         */
        return defaultTransform(tag);
    };
}

// Export transformation function
export default transformFunction;
