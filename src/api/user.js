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
        }catch (ex){
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
            const { results } = await model.query('SELECT * FROM ?? WHERE id = ? AND login_token = ? AND last_login_time >= ?',
                [prefix + 'user', id, token, NOW_TIME - maxAge]);

            resolve(results.length > 0);
        }catch (ex){
            reject(ex);
        }
    });

};

const Api = {
    userLogin,
    tokenLogin
};

export default Api;