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

store.getServices = () => Q.fcall(() => ['lannister-service',
    'stark-service',
    'tyrell-service',
    'targaryen-service',
    'baratheon-service',
    'dragon-service'
]);

store.getOperations = () => Q.fcall(() => ['op1',
    'op2',
    'op3',
    'op4'
]);

store.getTrace = () => Q.fcall(() => [
        {
            traceId: 'root-traceid',
            spanId: 'root-spanid',
            serviceName: 'stark-service',
            operationName: 'stark1',
            startTime: 1504784384000,
            duration: 3500000,
            logs: [
                {
                    timestamp: 1504784384000,
                    endpoint: {
                        serviceName: 'stark-service'
                    }
                }
            ],
            tags: [
                {
                    key: 'success',
                    value: 'true'
                }
            ]
        },
        {
            traceId: 'traceid1',
            spanId: 'spanid2',
            parentSpanId: 'root-spanid',
            serviceName: 'stark-service',
            operationName: 'stark2',
            startTime: 1504785384000,
            duration: 2000000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'stark-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'false'
                }
            ]
        },
        {
            traceId: 'traceid2',
            spanId: 'spanid3',
            parentSpanId: 'root-spanid',
            serviceName: 'stark-service',
            operationName: 'stark2',
            startTime: 1504785484000,
            duration: 320000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'stark-service'
                }
            }],
            tags: []
        },
        {
            traceId: 'traceid3',
            spanId: 'spanid4',
            parentSpanId: 'spanid3',
            serviceName: 'tyrell-service',
            operationName: 'tyrell1',
            startTime: 1504785584000,
            duration: 62000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'tyrell-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'false'
                }
            ]
        },
        {
            traceId: 'traceid7',
            spanId: 'spanid8',
            parentSpanId: 'spanid4',
            serviceName: 'tyrell-service',
            operationName: 'tyrell4',
            startTime: 1504785684000,
            duration: 62000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'tyrell-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'true'
                }
            ]
        },
        {
            traceId: 'traceid4',
            spanId: 'spanid5',
            parentSpanId: 'spanid3',
            serviceName: 'tyrell-service',
            operationName: 'tyrell2',
            startTime: 1504785684000,
            duration: 520000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'tyrell-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'true'
                }
            ]
        },
        {
            traceId: 'traceid5',
            spanId: 'spanid6',
            parentSpanId: 'spanid2',
            serviceName: 'stark-service',
            operationName: 'stark2',
            startTime: 1504785784000,
            duration: 2000000,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'stark-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'true'
                }
            ]
        },
        {
            traceId: 'traceid6',
            spanId: 'spanid7',
            parentSpanId: 'root-spanid',
            serviceName: 'dragon-service',
            operationName: 'dragon1',
            startTime: 1504786484000,
            duration: 320,
            logs: [{
                timestamp: 1504784384000,
                endpoint: {
                    serviceName: 'dragon-service'
                }
            }],
            tags: [
                {
                    key: 'success',
                    value: 'true'
                }
            ]
        }
    ]);

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
