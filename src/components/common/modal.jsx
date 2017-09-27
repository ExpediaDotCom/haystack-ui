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
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import './modal.less';

const modalStyles = {
    overlay: {
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    content: {
        width: '95%',
        maxWidth: '1240px',
        top: '10%',
        bottom: '5%',
        left: '0',
        right: '0',
        marginLeft: 'auto',
        marginRight: 'auto'
    }
};

const ModalView = ({title, isOpen, closeModal, children}) => (
    <Modal isOpen={isOpen} onRequestClose={closeModal} style={modalStyles} closeTimeoutMS={200} contentLabel={'Modal'}>
        <header className="clearfix">
            <h4 className="pull-left">{title}</h4>
            <button className="close pull-right" onClick={closeModal}>&times;</button>
        </header>
        <section>
            {children}
        </section>
    </Modal>
);

ModalView.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};

export default ModalView;
