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

import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../common/modal';

const RawTraceModal = ({isOpen, closeModal, spans}) => (
    <Modal isOpen={isOpen} closeModal={closeModal} title={'Raw Trace'}>
        {spans.map(span =>
            (<div>
                <pre>{JSON.stringify(span, null, 2)}</pre>
            </div>))}
    </Modal>);

RawTraceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    spans: PropTypes.array.isRequired
};

export default RawTraceModal;
