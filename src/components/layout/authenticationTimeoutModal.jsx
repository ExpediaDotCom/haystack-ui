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

import React from 'react';
import Modal from 'react-modal';

const modalStyles = {
    overlay: {
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    content: {
        width: '45%',
        maxWidth: '1240px',
        top: '25%',
        bottom: '65%',
        left: '0',
        right: '0',
        marginLeft: 'auto',
        marginRight: 'auto'
    }
};

export default () => (
    <Modal isOpen style={modalStyles} contentLabel={'Modal'}>
        <header className="clearfix">
            <div className="text-center">
                Authentication has timed out. Please <span role="button" className="modal-link" tabIndex={0} onClick={() => window.location.reload()}>reload</span> the page
            </div>
        </header>
    </Modal>
);
