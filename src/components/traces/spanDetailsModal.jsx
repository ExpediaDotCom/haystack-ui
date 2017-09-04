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
import {Link} from 'react-router-dom';

import Modal from '../common/modal';

const SpanDetailsModal = ({isOpen, closeModal, serviceName, span}) => (<Modal
    isOpen={isOpen}
    closeModal={closeModal}
    title={`[${serviceName}] ${span.name}: ${span.duration / 1000}ms`}
>
    <div className="clearfix">
        <p className="pull-left">{serviceName} - {span.duration / 1000}ms</p>
        <div className="pull-right btn-group">
            <Link className="btn btn-primary" to={`/service/${serviceName}/trends`}>
                <span className="ti-stats-up"/> Trends
            </Link>
            <Link className="btn btn-primary" to={`/service/${serviceName}/flow`}>
                <span className="ti-vector"/> Dependencies
            </Link>
        </div>
    </div>
    <table className="table table-striped">
        <thead>
        <tr>
            <th>Key</th>
            <th>Value</th>
        </tr>
        </thead>
        <tbody>
        {span.binaryAnnotations.map(annotation =>
            (<tr>
                <td>{annotation.key}</td>
                <td>{annotation.value}</td>
            </tr>)
        )}
        </tbody>
    </table>
</Modal>);

SpanDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    serviceName: PropTypes.string.isRequired,
    span: PropTypes.object.isRequired
};

export default SpanDetailsModal;
