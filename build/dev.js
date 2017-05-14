/**
 * Created by xiao on 2017/4/28.
 */
let fse = require('node-fs-extra');
let path = require('path');

console.log('removing old files...');
fse.removeSync(path.resolve(__dirname, '../public/static/dist'));

let execSync = function (cmd) {
    return require('child_process')
        .execSync(cmd, { stdio: "inherit" })
};
let exec = function (cmd, cb) {
    return require('child_process')
        .exec(cmd, { stdio: "inherit", cb})
};

console.log('starting server...');
let child_process = require("child_process");

let nodemonCmd = (process.platform == 'win32') ? 'node_modules\\.bin\\nodemon.cmd' : 'nodemon';
let proc_server = child_process.spawn(nodemonCmd, [], { stdio: "inherit" });

proc_server.on("exit", function (code, signal) {
    process.on("exit", function () {
        if (signal) {
            process.kill(process.pid, signal);
        } else {
            process.exit(code);
        }
    });
});

console.log('building for dev...');
let npmCmd = (process.platform == 'win32') ? 'npm.cmd' : 'npm';
let proc_client = child_process.spawn(npmCmd, ['run','build-client-watch'], { stdio: "inherit" });
proc_client.on("exit", function (code, signal) {
    process.on("exit", function () {
        if (signal) {
            process.kill(process.pid, signal);
        } else {
            process.exit(code);
        }
    });
});
