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
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

export default (trend =>
    (<div className="trend-graph__third">
        <LineChart
            width={350}
            height={300}
            data={trend.data}
        >
            <XAxis label="Time" dataKey="time"/>
            <YAxis label={<text glyphOrientationVertical="0" dx="10%" dy="30%" style={{writingMode: 'tb'}}>{trend.label}</text>} />
            <CartesianGrid strokeDasharray="1 3"/>
            <Tooltip/>
            <Line type="monotone" dataKey="value" stroke="#2A394F"/>
        </LineChart>
    </div>
    )
);
