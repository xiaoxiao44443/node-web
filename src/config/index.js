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
    charset         : 'utf8mb4_general_ci'
};

const cookieConfig = {
    maxAge: 1000*3600*24*3 //3天
};

const commentConfig = {
    enable: true,
    interval: 5000, //回复间隔5秒
    interval_msg: '回复过快，请不要再5秒内连续回复',
    limitInterval: 1000*3600, //判断1小时
    limit: 60, //1小时最多发表60条
    limitInterval_msg: '1小时内最多发表60条回复哦~'
};

const wbApp = {
    client_id: '',
    client_secret: ''
};

const mailConfig = {
    owner: '422291344@qq.com',
    owner_nickname: '、这不科学'
};

const smtpConfig = {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: '',
        pass: ''
    }
};

export {
    path,
    database,
    dbConfig,
    cookieConfig,
    commentConfig,
    wbApp,
    smtpConfig,
    mailConfig
};
