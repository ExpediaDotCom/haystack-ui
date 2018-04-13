module.exports = {
    // app port
    port: 8080,

    // use when https endpoint is needed
    // https: {
    //     keyFile: '', // path for private key file
    //     certFile: '' // path for ssh cert file
    // },

    // whether to start in cluster mode or not
    cluster: false,

    // default timeout in ms for all the downlevels from connector
    upstreamTimeout: 55000,

    graphite: {
        host: 'host',
        port: 2003
    },

    // Google Analytics Tracking ID
    gaTrackingID: 'UA-XXXXXXXX-X',

    // Feature switches
    enableServicePerformance: true,
    enableServiceLevelTrends: true, // enable

    // data connectors to connect to
    // this list defines subsystems for which UI should be enabled
    // traces connector must be there in connectors config
    connectors: {
        traces: {
            // name of config connector module to use for fetching traces data from downstream
            // Options (connector) :
            //  - haystack - gets data from haystack query service
            //  - zipkin - bridge for using an existing zipkin api,
            //             zipkin connector expects a zipkin config field specifying zipkin api url,
            //             eg. zipkinUrl: 'http://<zipkin>/api/v1'}
            //  - stub - a stub used during development, will be removed in future
            connectorName: 'stub'
        },
        trends: {
            // name of config connector module to use for fetching trends data from downstream
            // Options :
            //  - haystack - gets data from Haystack Metric Tank Setup
            //               haystack connector also expects config field specifying metricTankUrl
            //  - stub      - a stub used during development, will be removed in future
            connectorName: 'stub',
            encoder: 'periodreplacement'
        },
        alerts: {
            // name of config connector module to use for fetching anomaly detection data from downstream
            // Options :
            //  - stub - a stub used during development, will be removed in future
            connectorName: 'stub',
            alertsRefreshInterval: 60000 // refresh interval for Alert Tab Unhealthy Counter
        }
    }

    // use if you need SAML back SSO auth
    //
    // enableSSO: true, // flag for enabling sso
    // saml: {
    //     entry_point: '', // SAML entrypoint
    //     issuer: '' // SAML issuer
    // },
    // sessionTimeout: 60 * 60 * 1000, // timeout for session
    // sessionSecret: 'XXXXXXXXXXXXX' // secret key for session
};
