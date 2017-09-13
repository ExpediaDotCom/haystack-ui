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

import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ServiceTools from '../../../src/components/layout/serviceTools';


describe('<ServiceTools />', () => {
    it('should render the ServiceTools navigation menu`', () => {
        const wrapper = shallow(<ServiceTools match={{ params: {serviceName: 'traces'}}}><div /><div /></ServiceTools>);
        expect(wrapper.find('.serviceTools')).to.have.length(1);
    });
});
