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

const trace = [
    {
        traceId: 'traceid',
        spanId: 'root-spanid',
        serviceName: 'stark-service',
        operationName: 'snow-1',
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
        operationName: 'mormont-1',
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
        operationName: 'tully-1',
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
        operationName: 'drogo-1',
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
        operationName: 'grayjoy-1',
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
        operationName: 'clegane-1',
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
        operationName: 'dondarrion-1',
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
        operationName: 'grayjoy-1',
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
        operationName: 'tarley-1',
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
        operationName: 'snow-1',
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
        operationName: 'tarley-1',
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
        operationName: 'dondarrion-1',
        startTime: 1504784384000 + 2560000 + 105000 + 505000 + 225000,
        duration: 150000,
        logs: [],
        tags: []
    }
];

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

store.getOperations = () => Q.fcall(() => ['mormont-1',
    'seaworth-1',
    'bolton-1',
    'baelish-1',
    'snow-1',
    'tully-1',
    'dondarrion-1',
    'grayjoy-1',
    'clegane-1',
    'drogo-1',
    'tarley-1'
]);

store.getTrace = () => Q.fcall(() => trace);

store.getRawTrace = () => Q.fcall(() => trace);

store.getRawSpan = () => Q.fcall(() => trace[0]);

store.findTraces = query => Q.fcall(() => {
    if (query.traceId) {
        return [
          {
            traceId: '380965e5-e0c4-4c37-91a7-da79def7597b',
            spanCount: 12,
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
              operationName: 'snow-1',
              duration: 3404000,
              error: false
            },
            queriedService: {
              duration: 31000,
              durationPercent: 64,
              error: true
            },
            queriedOperation: {
              duration: 1,
              durationPercent: 0,
              error: false
            },
            startTime: new Date().getTime() * 1000,
            duration: 390000,
            error: true
          }
        ];
    }
    return [
      {
        traceId: 'x00245a5-g0c4-4c37-55a7-da83def7127a',
        spanCount: 34,
        services: [
          {
            name: 'stark-service',
            spanCount: 16
          },
          {
            name: 'targaryen-service',
            spanCount: 18
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'snow-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 23000,
          durationPercent: 99,
          error: false
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (10 * 1000 * 1000),
        duration: 240000,
        error: false
      }, {
        traceId: 'a40165e5-e0c4-4c51-11x7-bb79def7597a',
        spanCount: 9,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'rob-service',
            spanCount: 8
          }
        ],
        root: {
          url: '/rob/endpoint',
          serviceName: 'rob-service',
          operationName: 'mormont-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 590000,
          durationPercent: 64,
          error: false
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (15 * 1000 * 1000),
        duration: 850000,
        error: false
      }, {
        traceId: 'a80921e5-e0c4-4c37-91a7-da79def7597a',
        spanCount: 44,
        services: [
          {
            name: 'tyrell-service',
            spanCount: 22
          },
          {
                name: 'renly-service',
                spanCount: 22
          }
        ],
        root: {
          url: '/baratheon/endpoint',
          serviceName: 'gendry-service',
          operationName: 'dondarrion-1',
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
        startTime: (new Date().getTime() * 1000) - (18 * 1000 * 1000),
        duration: 3500000,
        error: false
      }, {
        traceId: 'a55965e5-e0c4-4a37-91a7-da79def7597a',
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
          operationName: 'clegane-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 120000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (18 * 1000 * 1000),
        duration: 126000,
        error: false
      }, {
        traceId: 'wb651a1b-146x-4c37-91a7-6r61v513r1v11',
        spanCount: 30,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'jon-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/east/endpoint',
          serviceName: 'stark-service',
          operationName: 'grayjoy-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 88,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (30 * 1000 * 1000),
        duration: 3500000,
        error: true
      },
      {
        traceId: 'b44165e5-xx14-4c37-91a7-da79def7597b',
        spanCount: 25,
        services: [
          {
            name: 'randall-service',
            spanCount: 1
          },
          {
            name: 'stark-service',
            spanCount: 29
          }
        ],
        root: {
          url: '/tarley/endpoint',
          serviceName: 'randall-service',
          operationName: 'tarley-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 2450000,
          durationPercent: 94,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (44 * 1000 * 1000),
        duration: 2450000,
        error: true
      },
      {
        traceId: 'c80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 19,
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
          url: '/targaryen/endpoint',
          serviceName: 'targaryen-service',
          operationName: 'drogo-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 5990000,
          durationPercent: 76,
          error: false
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
          startTime: (new Date().getTime() * 1000) - (56 * 1000 * 1000),
        duration: 3500000,
        error: false
      },
      {
        traceId: 'd80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 88,
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
          operationName: 'tully-1',
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
        startTime: (new Date().getTime() * 1000) - (90 * 1000 * 1000),
        duration: 3500000,
        error: false
      }, {
        traceId: 'e80965e5-e0c4-4c37-91a7-da79def7597b',
        spanCount: 12,
        services: [
          {
            name: 'stark-service',
            spanCount: 1
          },
          {
            name: 'westeros-service',
            spanCount: 5
          }
        ],
        root: {
          url: '/stark/endpoint',
          serviceName: 'stark-service',
          operationName: 'snow-1',
          duration: 3404000,
          error: false
        },
        queriedService: {
          duration: 1260000,
          durationPercent: 64,
          error: true
        },
        queriedOperation: {
          duration: 1,
          durationPercent: 0,
          error: false
        },
        startTime: (new Date().getTime() * 1000) - (2 * 1000 * 1000),
        duration: 3545000,
        error: false
      }
    ];
});

module.exports = store;
