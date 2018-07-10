const expect = require('chai').expect;
const Graph = require('../../../../../src/components/serviceGraph/util/graph');
const _ = require('lodash');

const edges = [
    {
        source: {
            name: 'stark-service',
            tags: {
                DEPLOYMENT: 'aws'
            }
        },
        destination: {
            name: 'baratheon-service'
        },
        stats: {
            count: 15.416666666666666,
            errorCount: 2.5
        }
    },
    {
        source: {
            name: 'stark-service'
        },
        destination: {
            name: 'grayjoy-service'
        },
        stats: {
            count: 5.834722222222222,
            errorCount: 0.2802777777777778
        }
    },
    {
        source: {
            name: 'baratheon-service'
        },
        destination: {
            name: 'lannister-service'
        },
        stats: {
            count: 6.515555555555555,
            errorCount: 0.18833333333333332
        }
    },
    {
        source: {
            name: 'baratheon-service'
        },
        destination: {
            name: 'clegane-service'
        },
        stats: {
            count: 0.11138888888888888,
            errorCount: 0.003611111111111111
        }
    },
    {
        source: {
            name: 'lannister-service'
        },
        destination: {
            name: 'tyrell-service'
        },
        stats: {
            count: 8.333333333333334,
            errorCount: 0.0005555555555555556
        }
    },
    {
        source: {
            name: 'tyrell-service'
        },
        destination: {
            name: 'targaryen-service'
        },
        stats: {
            count: 13.89,
            errorCount: 5.555555555555555
        }
    },
    {
        source: {
            name: 'tyrell-service'
        },
        destination: {
            name: 'tully-service'
        },
        stats: {
            count: 0.03361111111111111,
            errorCount: 0.0002777777777777778
        }
    },
    {
        source: {
            name: 'targaryen-service'
        },
        destination: {
            name: 'dragon-service'
        },
        stats: {
            count: 5.277777777777778,
            errorCount: 0.2222222222222222
        }
    },
    {
        source: {
            name: 'targaryen-service'
        },
        destination: {
            name: 'drogo-service'
        },
        stats: {
            count: 0.02722222222222222,
            errorCount: 0
        }
    },
    {
        source: {
            name: 'targaryen-service'
        },
        destination: {
            name: 'mormont-service'
        },
        stats: {
            count: 1.3888888888888888,
            errorCount: 0.027777777777777776
        }
    }
];

describe('Graph', () => {
    const graph = new Graph();

    before(() => {
        _.forEach(edges, (edge) => {
            graph.addEdge(edge);
        });
    });

    it('should return the error rate and request rate accurately for a given node', () => {
        const errorRate = graph.errorRateForNode('stark-service');
        const requestRate = graph.requestRateForNode('stark-service');
        expect(errorRate).to.equal('0');
        expect(requestRate).to.equal('0.00');

        const errorRate1 = graph.errorRateForNode('baratheon-service');
        const requestRate1 = graph.requestRateForNode('baratheon-service');
        expect(errorRate1).to.equal('16.22');
        expect(requestRate1).to.equal('15.42');
    });

    it('should return the error rate and request rate accurately for a given connection', () => {
        const errorRate = graph.errorRateForConnection('baratheon-service', 'clegane-service');
        const requestRate = graph.requestRateForConnection('baratheon-service', 'clegane-service');
        expect(errorRate).to.equal('3.24');
        expect(requestRate).to.equal('0.11');
    });

    it('should provide the list of tags for a given node', () => {
       const tags = graph.tagsForNode('stark-service');
       expect(tags.DEPLOYMENT).to.equal('aws');
    });

    it('should list the incoming and outgoing traffic details', () => {
        const incoming = graph.incomingTrafficForNode('grayjoy-service');
        const outgoing = graph.outgoingTrafficForNode('stark-service');
        expect(incoming[0]).to.equal('stark-service');
        expect(outgoing[0]).to.equal('baratheon-service');
    });
});
