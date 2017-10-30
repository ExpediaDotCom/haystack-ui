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

const Q = require('q');

const store = {};

store.getServices = () => Q.fcall(() => ['root-service',
    'lannister-service',
    'stark-service',
    'tyrell-service',
    'targaryen-service',
    'baratheon-service',
    'dragon-service',
    'westeros-service'
]);

store.getOperations = () => Q.fcall(() => ['op1',
    'op2',
    'op3',
    'op4'
]);

store.getTrace = () => Q.fcall(() => [
        {
            traceId: 'traceid',
            spanId: 'root-spanid',
            serviceName: 'root-service',
            operationName: 'root-operation-stark',
            startTime: 1504784384000,
            duration: 3525000,
            logs: [],
            tags: [{
                key: 'url',
                value: 'http://trace.io/blah'
            },
            {
                key: 'url2',
                value: 'some:data'
            }]
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'westeros-1',
            serviceName: 'westeros-service',
            operationName: 'operation-1-westeros-service',
            startTime: 1504784384000 + 250000,
            duration: 1505000,
            logs: [],
            tags: []
        },

        {
            traceId: 'traceid',
            parentSpanId: 'westeros-1',
            spanId: 'tyrell-1',
            serviceName: 'tyrell-service',
            operationName: 'operation-1-tyrell-service',
            startTime: 1504784384000 + 250000 + 120000,
            duration: 605000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'westeros-1',
            spanId: 'dragon-1',
            serviceName: 'dragon-service',
            operationName: 'operation-1-dragon-service',
            startTime: 1504784384000 + 250000 + 680000,
            duration: 645000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'westeros-1',
            spanId: 'dragon-2',
            serviceName: 'dragon-service',
            operationName: 'operation-2-dragon-service',
            startTime: 1504784384000 + 250000 + 680000,
            duration: 805000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'dragon-2',
            spanId: 'blackwater-2',
            serviceName: 'blackwater-service',
            operationName: 'operation-2-blackwater-service',
            startTime: 1504784384000 + 250000 + 920000,
            duration: 675000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'baratheon-1',
            serviceName: 'baratheon-service',
            operationName: 'operation-1-baratheon-service',
            startTime: 1504784384000 + 1760000,
            duration: 834000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'baratheon-1',
            spanId: 'blackwaters-1',
            serviceName: 'blackwater-service',
            operationName: 'operation-1-grayjoy-service',
            startTime: 1504784384000 + 1960000,
            duration: 234000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'westeros-2',
            serviceName: 'westeros-service',
            operationName: 'operation-2-westeros-service',
            startTime: 1504784384000 + 2560000 + 105000,
            duration: 105000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'westeros-3',
            serviceName: 'westeros-service',
            operationName: 'operation-3-westeros-service',
            startTime: 1504784384000 + 2560000 + 105000,
            duration: 505000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'westeros-4',
            serviceName: 'westeros-service',
            operationName: 'operation-4-westeros-service',
            startTime: 1504784384000 + 2560000 + 105000,
            duration: 505000 + 225000,
            logs: [],
            tags: []
        },
        {
            traceId: 'traceid',
            parentSpanId: 'root-spanid',
            spanId: 'westeros-5',
            serviceName: 'westeros-service',
            operationName: 'operation-5-westeros-service',
            startTime: 1504784384000 + 2560000 + 105000 + 505000 + 225000,
            duration: 150000,
            logs: [],
            tags: []
        }
    ]
);

store.findTraces = query => Q.fcall(() => {
    if (query.traceId) {
        return [
          {
            traceId: '380965e5-e0c4-4c37-91a7-da79def7597b',
            spanCount: 30,
            services: [
              {
                name: 'stark-service',
                spanCount: 1
              },
              {
                name: 'tyrell-service',
                spanCount: 29
              }
            ],
            root: {
              url: '/stark/endpoint',
              serviceName: 'stark-service',
              operationName: 'svc-operation',
              duration: 3404000,
              error: false
            },
            queriedService: {
              duration: 5990000,
              durationPercent: 64,
              error: true
            },
            queriedOperation: {
              duration: 1,
              durationPercent: 0,
              error: false
            },
            startTime: 1505914774596000,
            duration: 3500000,
            error: true
          }
        ];
    }
    return [
      {
        traceId: 'a80965e5-e0c4-4c37-91a7-da79def7597a',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'tyrell-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'svc-operation',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: 1505914774596000,
        duration: 3500000,
        error: true
      },
      {
        traceId: 'b80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'tyrell-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'svc-operation',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: 1505914774596000,
        duration: 3500000,
        error: true
      },
      {
        traceId: 'c80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'tyrell-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'svc-operation',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 64,
          error: false
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: 1505914774596000,
        duration: 3500000,
        error: false
      },
      {
        traceId: 'd80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'tyrell-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'svc-operation',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: 1505914774596000,
        duration: 3500000,
        error: false
      },
      {
        traceId: 'e80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'tyrell-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'svc-operation',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: 1505914774596000,
        duration: 3500000,
        error: true
      }
    ];
});

module.exports = store;
