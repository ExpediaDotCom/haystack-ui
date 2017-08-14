const path = require('path');

const webpack = require('webpack');

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

// Less
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
    filename: 'bundles/style/[name].css'
});

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
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: extractLess.extract({
                    use: [{
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: 'less-loader', // compiles Less to CSS
                        options: {
                            sourceMap: true
                        }
                    }],
                    // use style-loader in development
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loaders: ['file-loader?&emitFile=false&publicPath=/fonts/&name=[name].[ext]']
            }
        ]
    },
    plugins: [
        extractLess,
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
        path: appPaths.public
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    devServer: {
        hot: true
    }
};
