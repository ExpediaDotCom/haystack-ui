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

store.getTrace = () => Q.fcall(() => [
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'stark-service',
        id: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422393939000,
        duration: 3061000,
        annotations: [],
        binaryAnnotations: []
    },
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'tyrell-service',
        id: 'dbc9bdc9-30de-41a7-974b-afavw3a8994',
        parentId: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422393036500,
        duration: 3061000,
        annotations: [],
        binaryAnnotations: []
    },
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'targaryen-service',
        id: '45145kj1-e322-441c-8ed7-1df91vr23e7f',
        parentId: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422394968000,
        duration: 1895000,
        annotations: [],
        binaryAnnotations: []
    },
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'lannister-service',
        id: '93arb321-aea7-42aa-aa1a-cf0dqvr3eab7',
        parentId: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422394988000,
        duration: 2000,
        annotations: [],
        binaryAnnotations: []
    },
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'dragon-service',
        id: '071edd87-ef99-483c-aw3f-8f4bc4f13c84',
        parentId: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422395615000,
        duration: 110000,
        annotations: [],
        binaryAnnotations: []
    },
    {
        traceId: 'az11b089-429b-4a3z-177a-11116448z1z2',
        name: 'baratheon-service',
        id: 'av1w1ef1-a136-405c-97b9-be41f234d1140',
        parentId: '63faxc76-38z9-4111-154f-d33c963d4321',
        timestamp: 1503422397779000,
        duration: 3000,
        annotations: [],
        binaryAnnotations: []
    }]
);

store.findTraces = () => Q.fcall(() => [
    {
        traceId: '15b83d5f-64e1-4f69-b038-aaa23rfn231',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 45211
            },
            {
                name: 'def-service',
                spanCount: 29,
                duration: 51
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 45211
            }
        ],
        error: true,
        startTime: 1499975993,
        duration: 829548
    },
    {
        traceId: '23g89z5f-64e1-4f69-b038-c123rc11r12',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 15000
            },
            {
                name: 'def-service',
                spanCount: 12,
                duration: 1000
            },
            {
                name: 'ghi-service',
                spanCount: 12,
                duration: 1000
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 117765
    },
    {
        traceId: '45a13f6z-64e1-4f69-b038-1t241t23z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 21000
            },
            {
                name: 'def-service',
                spanCount: 32,
                duration: 29000
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 2500
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 513519
    },
    {
        traceId: '88f53n5t-64e1-4f69-b038-vs455sv4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 151
            },
            {
                name: 'def-service',
                spanCount: 1,
                duration: 4344
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 6789
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 13513
    },
    {
        traceId: '15b83d5f-64e1-4f69-b038-aaa23rfn23r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 2,
                duration: 80000
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 4000
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 5548
            }
        ],
        error: true,
        startTime: 1499975993,
        duration: 895483
    },
    {
        traceId: '23g89z5f-64e1-4f69-b038-c123rc1c1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 5151
            },
            {
                name: 'def-service',
                spanCount: 12,
                duration: 6161
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 5151
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 171765
    },
    {
        traceId: '45a13f6z-64e1-4f69-b038-1t444t23z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 48573
            },
            {
                name: 'def-service',
                spanCount: 22,
                duration: 2345
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 1234
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 1151351
    },
    {
        traceId: '48f53n5t-64e1-4f69-b038-vs455sv4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 8000
            },
            {
                name: 'def-service',
                spanCount: 11,
                duration: 1
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 5000
            }
        ],
        error: true,
        startTime: 1499945993,
        duration: 135131
    },
    {
        traceId: '35b83d5f-64e1-4f69-b038-aaa23rfn23r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 9000
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 1
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 80000
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 89548
    },
    {
        traceId: '33g89z5f-64e1-4f69-b038-c123rc1c1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 2000
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 5000
            },
            {
                name: 'ghi-service',
                spanCount: 11,
                duration: 10000
            }
        ],
        error: true,
        startTime: 1499985993,
        duration: 177615
    },
    {
        traceId: '35a13f6z-64e1-4f69-b038-1t241t23z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 400012
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 1234
            },
            {
                name: 'ghi-service',
                spanCount: 15,
                duration: 45211
            }
        ],
        error: true,
        startTime: 1499869444,
        duration: 512351
    },
    {
        traceId: '38f53n5t-64e1-4f69-b038-vs455sv4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 96789
            },
            {
                name: 'def-service',
                spanCount: 18,
                duration: 2345
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 1234
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 135131
    },
    {
        traceId: '25b83d5f-64e1-4f69-b038-aaa23rfn23r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 843212
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 4321
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 43121
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 895483
    },
    {
        traceId: '13g89z5f-64e1-4f69-b038-c123rc1d1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 16789
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 1234
            },
            {
                name: 'ghi-service',
                spanCount: 22,
                duration: 1234
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 177651
    },
    {
        traceId: '25a13f6z-64e1-4f69-b038-1t241t23z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 9,
                duration: 48211
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 2345
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 1234
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 51351
    },
    {
        traceId: '28f53n5t-64e1-4f69-b038-vs455sv4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 111513
            },
            {
                name: 'def-service',
                spanCount: 1,
                duration: 5000
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 8000
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 195131
    },
    {
        traceId: '15b83d5f-64e1-41z9-b138-aaa23rfn23r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 29000
            },
            {
                name: 'def-service',
                spanCount: 29,
                duration: 35000
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 25000
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 89548
    },
    {
        traceId: '23g89z5f-64e1-4f69-b038-c123rc1c1a1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 144000
            },
            {
                name: 'def-service',
                spanCount: 12,
                duration: 8000
            },
            {
                name: 'ghi-service',
                spanCount: 12,
                duration: 5000
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 217765
    },
    {
        traceId: '51a13f6z-64e1-4f69-b138-1t241t23z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 420002
            },
            {
                name: 'def-service',
                spanCount: 32,
                duration: 5135
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 3123
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 513512
    },
    {
        traceId: '88f53n5t-64e1-4f69-b038-vs455sfav3vs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 111111
            },
            {
                name: 'def-service',
                spanCount: 1,
                duration: 1111
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 11111
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 135131
    },
    {
        traceId: '11z83d5f-64e1-4f69-b038-aaa23rfn23r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 2,
                duration: 295482
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 30000
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 30000
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 895481
    },
    {
        traceId: '23g89z5f-64e1-4f69-b038-c124rc1c1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 12000
            },
            {
                name: 'def-service',
                spanCount: 12,
                duration: 3535
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 1531
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 17765
    },
    {
        traceId: '45a13f6z-64e1-5aa3-b038-1t23f13z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 9001
            },
            {
                name: 'def-service',
                spanCount: 22,
                duration: 1
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 51521
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 59351
    },
    {
        traceId: '48f53n5t-z4e1-4f69-b038-vs4av1v4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 11000
            },
            {
                name: 'def-service',
                spanCount: 11,
                duration: 1000
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 1000
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 13513
    },
    {
        traceId: '35b83d5f-64e1-4f69-b038-13rc31fa3',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 88000
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 444
            },
            {
                name: 'ghi-service',
                spanCount: 1,
                duration: 111
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 89548
    },
    {
        traceId: '3a3f9z5f-64e1-4f69-b038ra1c1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 6100
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 500
            },
            {
                name: 'ghi-service',
                spanCount: 11,
                duration: 11111
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 17765
    },
    {
        traceId: '35a13f6z-64e1-4f69-b038-1tafv3a3z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 1,
                duration: 21212
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 13131
            },
            {
                name: 'ghi-service',
                spanCount: 15,
                duration: 15151
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 51351
    },
    {
        traceId: '38f53n5t-64e1-4f69-b038-vs4awbf3avs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 7000
            },
            {
                name: 'def-service',
                spanCount: 18,
                duration: 3222
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 2131
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 13513
    },
    {
        traceId: '2a2rv5f-64e1-4f69-b038-aaav3fva323r',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 12,
                duration: 31564
            },
            {
                name: 'def-service',
                spanCount: 9,
                duration: 23753
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 45211
            }
        ],
        error: false,
        startTime: 1499975993,
        duration: 89548
    },
    {
        traceId: '13g89z5f-64e1-4fav-b038-cav23rv1r1',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 11,
                duration: 8151
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 3151
            },
            {
                name: 'ghi-service',
                spanCount: 22,
                duration: 5131
            }
        ],
        error: false,
        startTime: 1499985993,
        duration: 17765
    },
    {
        traceId: '25a11zf6z-64e1-4f69-b038-1av3faf33z4t',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 9,
                duration: 33333
            },
            {
                name: 'def-service',
                spanCount: 2,
                duration: 22222
            },
            {
                name: 'ghi-service',
                spanCount: 31,
                duration: 13111
            }
        ],
        error: false,
        startTime: 1499869444,
        duration: 51351
    },
    {
        traceId: '28a3rv5t-64e1-4f69-b038-vsav3r4gvs',
        root: {
            url: '/dummy/url',
            serviceName: 'mysvc',
            operationName: 'dummyOperation'
        },
        services: [
            {
                name: 'abc-service',
                spanCount: 3,
                duration: 222
            },
            {
                name: 'def-service',
                spanCount: 1,
                duration: 111
            },
            {
                name: 'ghi-service',
                spanCount: 4,
                duration: 12313
            }
        ],
        error: false,
        startTime: 1499945993,
        duration: 13513
    }
]);

module.exports = store;
