/**
 * Created by xiao on 2017/2/26.
 */
const path =  {
    staticPath: 'static',
    cssPath: 'static/css',
    jsPath: 'static/js',
    imagesPath: 'static/images'
};

const dbConfig = {
    prefix: 'lo_'
};
let database = {
    host            : '127.0.0.1',
    user            : 'root',
    password        : '1',
    port            : '3306',
    socketPath      : process.platform === 'darwin' ? '/Applications/MAMP/tmp/mysql/mysql.sock' : '',
    database        : 'node_web',
};

const cookieConfig = {
    maxAge: 1000*3600*24*3 //3天
};

export {
    path,
    database,
    dbConfig,
    cookieConfig
};
