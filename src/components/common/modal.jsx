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
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

export default class ModalView extends React.Component {

    render() {
        const modalStyles = {
            overlay: {
                zIndex: 10
            },
            content: {
                width: '60%',
                top: '10%',
                bottom: '10%',
                left: '20%'
            }
        };

        return (
            <Modal isOpen={this.props.isOpen} onRequestClose={this.props.closeModal} style={modalStyles} closeTimeoutMS={200}>
                <h4>{this.props.title}</h4>
                {this.props.children}
                <button onClick={this.props.closeModal}>close</button>
            </Modal>
        );
    }
}

ModalView.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};
