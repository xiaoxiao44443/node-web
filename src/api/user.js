/**
 * Created by xiao on 2017/5/14.
 */
import { dbConfig, cookieConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import { createUserToken, userPassword } from '../tool/userToken';

const userLogin =  (account, password, group_id = 1) => {
    return new Promise(async(resolve, reject) => {
        //TODO 多token登录
        const model = new Model(false);
        const psw = userPassword(password);
        const { results } = await model.query('SELECT * FROM ?? WHERE account = ? AND password = ? AND group_id = ? LIMIT 1', [prefix + 'user', account, psw, group_id]);

        if(results.length == 0){
            await model.end();
            return resolve( false );
        }
        let userInfo = results[0];

        const NOW_TIME = parseInt(Date.now() / 1000);
        //更新token
        userInfo.login_token = createUserToken();
        userInfo.last_login_time = NOW_TIME;
        //保存用户信息
        const updates = {
            login_token: userInfo.login_token,
            last_login_time: NOW_TIME
        };

        try {
            await model.query('UPDATE ?? SET ? WHERE id = ?',[prefix + 'user', updates, userInfo.id]);
            await model.end();

            resolve( userInfo );
        }catch (err){
            resolve( false );
        }
    });

};

const tokenLogin = (id, token) => {

    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            const maxAge = cookieConfig.maxAge;
            const NOW_TIME = parseInt(Date.now() / 1000);
            const { results } = await model.query('SELECT * FROM ?? WHERE id = ? AND login_token = ? AND last_login_time >= ? LIMIT 1',
                [prefix + 'user', id, token, NOW_TIME - maxAge]);

            resolve(results.length > 0 ? results[0] : false);
        }catch (err){
            reject(err);
        }
    });

};

const getWbUserInfo = (weibo_uid) => {

    return new Promise(async(resolve, reject) => {
       try {
           let model = new Model;

           const { results } = await model.query('SELECT * FROM ?? WHERE weibo_uid = ? LIMIT 1', [prefix + 'user', weibo_uid]);
           resolve(results);
       }catch (err){
           resolve(err);
       }
    });
};

const createWbUser = (user_info) => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            const NOW_TIME = parseInt(Date.now() / 1000);

            const insert = {
                account: '',
                nickname: user_info.nickname,
                head: user_info.head,
                password: '',
                create_time: NOW_TIME,
                email: '',
                profile_url: user_info.profile_url,
                sex: user_info.sex,
                group_id: 3, //访客
                account_type: 100,
                weibo_access_token: user_info.weibo_access_token,
                weibo_uid: user_info.weibo_uid,
                last_login_time: NOW_TIME,
                login_token: ''
            };
            let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'user', insert]);
            resolve(results.affectedRows >0);
        }catch (err){
            reject(err);
        }
    })
};

const updateWbUser = (user_info, update_login_token = false) => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            let update = {
                nickname: user_info.nickname,
                head: user_info.head,
                profile_url: user_info.profile_url,
                sex: user_info.sex,
                weibo_access_token: user_info.weibo_access_token,
            };
            if(update_login_token) update.login_token = createUserToken();
            let { results } = await model.query('UPDATE ?? SET ? WHERE weibo_uid = ?', [prefix + 'user', update, user_info.weibo_uid]);
            resolve(results.affectedRows >=0);
        }catch (err){
            reject(err);
        }
    })
};

const getZsUserInfo = (zs_name) => {

    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            const { results } = await model.query('SELECT * FROM ?? WHERE account = ? AND account_type = 101 LIMIT 1', [prefix + 'user', zs_name]);
            resolve(results);
        }catch (err){
            resolve(err);
        }
    });
};

const createZsUser = (user_info) => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            const NOW_TIME = parseInt(Date.now() / 1000);

            const insert = {
                account: user_info.account,
                nickname: user_info.nickname,
                head: user_info.head,
                password: '',
                create_time: NOW_TIME,
                email: '',
                profile_url: '',
                sex: user_info.sex,
                group_id: 3, //访客
                account_type: 101,
                weibo_access_token: '',
                weibo_uid: '',
                last_login_time: NOW_TIME,
                login_token: ''
            };
            let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'user', insert]);
            resolve(results.affectedRows >0);
        }catch (err){
            reject(err);
        }
    })
};

const updateZsUser = (user_info, update_login_token = false) => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            let update = {
                head: user_info.head,
                sex: user_info.sex,
            };
            if(update_login_token) update.login_token = createUserToken();
            let { results } = await model.query('UPDATE ?? SET ? WHERE account = ? AND account_type = 101', [prefix + 'user', update, user_info.account]);
            resolve(results.affectedRows >=0);
        }catch (err){
            reject(err);
        }
    })
};

const Api = {
    userLogin,
    tokenLogin,
    getWbUserInfo,
    createWbUser,
    updateWbUser,
    getZsUserInfo,
    createZsUser,
    updateZsUser
};

export default Api;