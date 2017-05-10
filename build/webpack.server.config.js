/**
 * Created by xiao on 2017/2/28.
 */
let webpack = require('webpack');
let fs = require('fs');
let path = require('path');

let nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
nodeModules['react-dom/server'] = 'commonjs react-dom/server';

let config = {
    entry: [
        './www/app'
    ],
    target: 'node', //指明编译方式为 node,
    node: {
        __dirname: true, //可以避免__dirname 被污染,
        __filename: true
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'server.js' //编译结果的文件名
    },
    externals: nodeModules, //不打包其他库
    module:{
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader:'babel-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ],
    resolve: {
        extensions: ['.js']
    }
};

module.exports = config;