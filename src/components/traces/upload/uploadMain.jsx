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

import React from 'react';
import { observer } from 'mobx-react';
// import PropTypes from 'prop-types';

import Header from '../../layout/slimHeader';
import Footer from '../../layout/footer';
import TimelineTab from '../details/timeline/timelineTab';
import traceDetailsStore from '../stores/traceDetailsStore';
// import Error from '../../common/error';
import '../traces.less';

@observer
export default class UploadMain extends React.Component {
    render() {
        return (
            <section>
                <Header />
                    <TimelineTab
                        timelineSpans={traceDetailsStore.timelineSpans}
                        totalDuration={traceDetailsStore.totalDuration}
                        startTime={traceDetailsStore.startTime}
                        toggleExpand={traceDetailsStore.toggleExpand}
                    />
                    {/* todo: add error handling */}
                    {/* <Error errorMessage="There was a problem displaying the timeline tab. Please try again later."/> */}
                <Footer />
            </section>
        );
    }
}
