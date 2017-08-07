module.exports = {
    appName: 'haystack-ui',
    port: process.env.PORT || 8080,
    accessLog: {
        fileSize: '1000000',
        keep: 10,
        compress: true
    },
    preferClusterMode: false
};
