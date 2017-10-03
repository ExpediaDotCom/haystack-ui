module.exports = {
    // app port
    port: 8080,

    // whether to start in cluster mode or not
    cluster: false,

    // list of subsystems for which UI should be enabled,
    // options - can be any combination of traces, trends, dependency and alerts
    // or,  all for enabling all subsystems
    subsystems: ['all'],

    // name of config store module to use for fetching traces data from downstream
    // Options (store) :
    //  - haystack - gets data from haystack query service
    //  - zipkin - bridge for an existing zipkin api,
    //             please note that only tracing sybsystem is supported through zipkinStore
    //             zipkinBridge store expects a zipkin config field specifying zipking api url,
    //             eg. zipkin: { url: 'http://<zipkin>/api/v1'}
    //  - stub      - a stub used during development, will be removed in future

    traces: {
        store: 'stub'
    },

    // name of config store module to use for fetching trends data from downstream
    // Options :
    //  - haystack - gets data from haystack trends
    //  - stub      - a stub used during development, will be removed in future

    trends: {
        store: 'stub'
    },
    // configs for logs
    logs: {
        colorize: true
    }
};
