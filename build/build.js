/**
 * Created by xiao on 2017/4/28.
 */
let fse = require('node-fs-extra');
let path = require('path');

let execSync = function (cmd) {
    return require('child_process')
        .execSync(cmd, { stdio: "inherit" })
};

console.log('removing old files...');

fse.removeSync(path.resolve(__dirname, '../public/static/dist'));

console.log('building for production...');

execSync('npm run build');