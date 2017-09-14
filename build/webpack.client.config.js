/**
 * Created by xiao on 2017/2/27.
 */
let webpack = require('webpack');
let path = require('path');
let ExtractTextPlugin = require("extract-text-webpack-plugin");

let config = {
    entry: ['./src/main.js'],
    output: {
        path: path.resolve(__dirname, '../public/static/dist'),
        filename: 'main.js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader:'babel-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }

        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env' : {
                'NODE_ENV' : JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new ExtractTextPlugin("style.css")
    ]
};

if(process.env.NODE_ENV === 'production'){
    config.entry.unshift('babel-polyfill');
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['import', '$', 'export']
            },
            compress: {
                warnings: false
            }
        })
    );
}
module.exports = config;