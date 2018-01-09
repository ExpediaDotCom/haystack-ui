module.exports = {
    // app port
    port: 8080,

    // whether to start in cluster mode or not
    cluster: false,

    // default timeout in ms for all the downlevels from store
    upstreamTimeout: 60000,

    // Google Analytics Tracking ID
    gaTrackingID: 'UA-XXXXXXXX-X',

    // Switch for Service Performance Component
    servicePerformanceComponent: true,

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
            storeName: 'stub',
            fieldKeys: ['traceId', 'error', 'minDuration']
        },
        trends: {
            // name of config store module to use for fetching trends data from downstream
            // Options :
            //  - haystack - gets data from Haystack Metric Tank Setup
            //               haystack store also expects config field specifying metricTankUrl
            //  - stub      - a stub used during development, will be removed in future
            storeName: 'doppler',
            dopplerUrl: 'https://dts-api.test.expedia.com',
            queue: 'haystack-spans',
            operationCountTemplateName: 'haystack-count-trend-generic:countMetric:{operationName,serviceName}',
            operationDurationTemplateName: 'haystack-duration-trend-generic:histfield=duration:{duration,operationName,serviceName}',
            operationSuccessTemplateName: 'haystack-success-count-trend-generic:countMetric:{operationName,serviceName,success}',
            serviceCountTemplateName: 'CountByServiceNameServiceRoot-generic:countMetric:{service-root,serviceName}',
            serviceDurationTemplateName: 'HistByDurationServiceNameServiceRoot-generic:histfield=duration:{duration, serviceName, service-root}',
            serviceSuccessTemplateName: 'CountByServiceNameServiceRootError-generic:countMetric:{error, service-root,serviceName}'
        }
    }
};
