const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// paths --------------------------------------------------------------------------------------------------------
const appPaths = {
    public: path.join(__dirname, 'public'),
    bundles: path.join(__dirname, 'public/bundles'),

    source: path.join(__dirname, 'src'),
    sourceAppJsx: path.join(__dirname, 'src/app.jsx'),
    sourceStyle: path.join(__dirname, 'src/'),

    views: path.join(__dirname, 'views'),
    indexView: path.join(__dirname, 'views/index.pug')
};

// plugins ------------------------------------------------------------------------------------------------------

// progress plugin
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const chalk = require('chalk'); // Provided through ProgressBarPlugin

const progressBarOptions = {
    format: `    ${chalk.blue.bold('build')} [:bar] ${chalk.green.bold(':percent')} (:elapsed s) :msg`,
    clear: false,
    complete: chalk.yellow(' \u2708'),
    incomplete: '  ',
    width: 20
};

// main config  -----------------------------------------------------------------------------------------------
// main webpack export
module.exports = {
    entry: {
        app: appPaths.sourceAppJsx
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: ['lodash', 'transform-decorators-legacy'],
                    presets: ['env', 'react', 'stage-1']
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    'less-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: 'bundles/style/[name].css'}),
        new LodashModuleReplacementPlugin(),
        new ProgressBarPlugin(Object.assign({}, progressBarOptions)),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            generateStatsFile: false,
            reportFilename: 'bundles/report.html',
            openAnalyzer: false
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    output: {
        filename: 'bundles/js/[name].js',
        sourceMapFilename: 'bundles/js/[name].js.map',
        path: appPaths.public
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx']
    },
    devtool: 'source-map'
};
