/**
 * Created by xiao on 2017/5/14.
 */
import { dbConfig, cookieConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import { createUserToken, userPassword } from '../tool/userToken';

const userLogin =  (account, password, group_id = 1) => {
    return new Promise(async(resolve, reject) => {
        let model = new Model;
        const psw = userPassword(password);
        const { results } = await model.query('SELECT * FROM ?? WHERE account = ? AND password = ? AND group_id = ? LIMIT 1', [prefix + 'user', account, psw, group_id]);

        if(results.length == 0){
            return resolve( false );
        }
        let userInfo = results[0];

        const NOW_TIME = parseInt(Date.now() / 1000);

        userInfo.last_login_time = NOW_TIME;
        //保存用户信息
        const updates = {
            last_login_time: NOW_TIME
        };

        model = new Model(false);
        await model.startTrans();
        try {
            await model.query('UPDATE ?? SET ? WHERE id = ?',[prefix + 'user', updates, userInfo.id]);

            const login_token = await addLoginToken(userInfo.id);

            await model.commit();
            await model.end();

            //返回login_token字段供前台使用
            userInfo.login_token = login_token;

            resolve( userInfo );
        }catch (err){
            await model.rollback();
            await model.end();
            resolve( false );
        }
    });

};

const tokenLogin = (id, token) => {

    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model(false);

            const maxAge = cookieConfig.maxAge;
            const NOW_TIME = parseInt(Date.now() / 1000);
            const { results } = await model.query('SELECT * FROM ?? WHERE user_id = ? AND login_token = ? AND login_time >= ? LIMIT 1',
                [prefix + 'user_login', id, token, NOW_TIME - maxAge]);
            if(results.length > 0){
                //获取用户信息
                const { results } = await model.query('SELECT * FROM ?? WHERE id = ? LIMIT 1', [prefix + 'user', id]);
                model.end();
                return resolve(results.length > 0 ? results[0] : false);
            }

            model.end();
            resolve(results.length > 0 ? results[0] : false);
        }catch (err){
            reject(err);
        }
    });

};

const addLoginToken = id => {
    return new Promise(async(resolve, reject) => {
        try {
            const NOW_TIME = parseInt(Date.now() / 1000);
            let model = new Model(false);

            //清除过期失效的token
            const maxAge = cookieConfig.maxAge;
            await model.query('DELETE FROM ?? WHERE user_id = ? AND login_time < ?', [prefix + 'user_login', id, NOW_TIME - maxAge]);

            //添加token到user_login表
            const insert = {
                user_id: id,
                login_time: NOW_TIME,
                login_token: createUserToken()
            };
            await model.query('INSERT INTO ?? SET ?', [prefix + 'user_login', insert]);

            await model.end();

            resolve(insert.login_token);
        }catch (err){
            reject(err);
        }
    })
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
                last_login_time: NOW_TIME
            };
            let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'user', insert]);
            resolve(results.affectedRows >0);
        }catch (err){
            reject(err);
        }
    })
};

const updateWbUser = user_info => {
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
                last_login_time: NOW_TIME
            };
            let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'user', insert]);
            resolve(results.affectedRows >0);
        }catch (err){
            reject(err);
        }
    })
};

const updateZsUser = (user_info) => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;

            let update = {
                head: user_info.head,
                sex: user_info.sex,
            };
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
    updateZsUser,
    addLoginToken
};

export default Api;