module.exports = {
    // app port
    port: 8080,

    // whether to start in cluster mode or not
    cluster: false,

    // default timeout in ms for all the downlevels from store
    upstreamTimeout: 60000,

    // Google Analytics Tracking ID
    gaTrackingID: 'UA-XXXXXXXX-X',

    // data stores to connect to
    // this list defines subsystems for which UI should be enabled
    // traces store must be there in stores config
    stores: {
        traces: {
            // name of config store module to use for fetching traces data from downstream
            // Options (store) :
            //  - haystack - gets data from haystack query service
            //  - zipkin - bridge for using an existing zipkin api,
            //             zipkin store expects a zipkin config field specifying zipking api url,
            //             eg. zipkinUrl: 'http://<zipkin>/api/v1'}
            //  - stub - a stub used during development, will be removed in future
            storeName: 'stub'
        },
        trends: {
            // name of config store module to use for fetching trends data from downstream
            // Options :
            //  - haystack - gets data from Haystack Metric Tank Setup
            //               haystack store also expects config field specifying metricTankUrl
            //  - stub      - a stub used during development, will be removed in future
            storeName: 'stub'
        }
    }
};
