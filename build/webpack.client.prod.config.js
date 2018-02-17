/**
 * Created by xiao on 2017/5/5.
 */
process.env.NODE_ENV = 'production';
let config = require('./webpack.client.config');
config.devtool = 'cheap-source-map';
module.exports = config;