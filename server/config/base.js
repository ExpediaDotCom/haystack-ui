module.exports = {
    // app port
    port: 8080,

    // whether to start in cluster mode or not
    cluster: false,

    // list of subsystems for which UI should be enabled,
    // options - can be any combination of traces, trends, dependency and alerts
    // or,  all for enabling all subsystems
    subsystems: ['all'],

    // name of and config store module to use for fetching data from downstream
    // options
    //  - haystackStore - gets data from haystack query services
    //  - zipkinBrideStore - uses some existing zipkin api,
    //                       please note that only tracing sybsystem is supported through zipkinStore
    //                       zipkinBridge store expects a zipkin config field specifying zipking api url,
    //                       eg. zipkin: { url: 'http://<zipkin>/api/v1'}
    //  - stubStore - a stub used during development, will be removed in future
    store: {
        name: 'stubStore'
    },

    // configs for logs
    logs: {
        colorize: true
    }
};
