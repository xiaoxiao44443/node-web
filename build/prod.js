/**
 * Created by xiao on 2017/4/28.
 */
let path = require('path');

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
