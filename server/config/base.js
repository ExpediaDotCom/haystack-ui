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
    //  - haystack - gets data from haystack query services
    //  - zipkin   - bridge for an existing zipkin api,
    //               please note that only tracing sybsystem is supported through zipkinStore
    //               zipkinBridge store expects a zipkin config field specifying zipking api url,
    //               eg. zipkin: { url: 'http://<zipkin>/api/v1'}
    //  - stub      - a stub used during development, will be removed in future
    store: {
        name: 'zipkin',
      zipkin: {
        url: 'http://blackbox.test.expedia.com/api/v1'
      }
    }
};
