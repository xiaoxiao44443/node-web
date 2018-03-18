/**
 * Created by xiao on 2017/5/6.
 */
import express from 'express';
import configApi from '../api/config';
import serverRender from './server-render';
import userApi from '../api/user';
import serverHttp from './server-http';

class _Request {
    constructor(){
        this.REQUEST_JSON = false;
        this.router = express.Router();
        this.USER = {};

        let RequestBefore = async(req, res, next) => {
            try {
                let accept = req.header('accept');
                this.REQUEST_JSON = accept.indexOf('application/json') !== -1;
                //获取网站配置
                this.websiteConfig = await configApi.website();

                //用户是否登录
                const id = req.cookies.id || 0;
                const token = req.cookies.token || '';
                const userInfo = await userApi.tokenLogin(id, token);
                if(userInfo){
                    this.USER = {
                        id: userInfo.id,
                        group_id: userInfo.group_id,
                        head: userInfo.head,
                        nickname: userInfo.nickname,
                        sex: userInfo.sex,
                        email: userInfo.email,
                        profile_url: userInfo.profile_url
                    };
                    if(userInfo.account_type == 100){
                        const NOW_TIME = Math.round(Date.now() / 1000);
                        if (userInfo.oauth2_last_update_time < NOW_TIME - 3600 * 2) {
                            //获取微博用户信息 最少间隔2钟头更新一次
                            try {
                                let result = await serverHttp.apiGet(`https://api.weibo.com/2/users/show.json?access_token=${userInfo.weibo_access_token}&uid=${userInfo.weibo_uid}`);
                                const user_info = {
                                    weibo_uid: result.id,
                                    nickname: result.name,
                                    head: result.avatar_large,
                                    sex: {m:1 ,f: 0, n: 2}[result.gender],
                                    profile_url: result.profile_url,
                                    weibo_access_token: userInfo.weibo_access_token,

                                };
                                await userApi.updateWbUser(user_info);
                            }catch (err){
                                //失败 清除cookies
                                this.USER = {};
                                res.clearCookie('id').clearCookie('token');
                            }
                        }
                    }
                }else{
                    this.USER = {};
                }
                next();
            } catch (ex) {
                next(ex);
            }
        };
        RequestBefore = RequestBefore.bind(this);

        let method = ['use', 'get', 'post'];
        method.forEach((val) => {
            this[val] = (fn, ...fns) => {
                let arg, path = '/';
                if(typeof fn !== 'function'){
                    arg = fn;

                    while (Array.isArray(arg) && arg.length !== 0) {
                        arg = arg[0];
                    }
                    // first arg is the path
                    if (typeof arg !== 'function') {
                        path = arg;
                    }
                    if (fns.length === 0) {
                        throw new TypeError('Request.use() requires middleware functions');
                    }

                    fns.forEach(_fn => {
                        this.router[val](path, RequestBefore);
                        this.router[val](path, _fn);
                    });
                }else{
                    this.router[val](RequestBefore);
                    this.router[val](fn);
                }

            }
        });
    }
}

export const returnSuc = (data, title, url, other) =>{
    let ret = {code:0, data};
    if(title) ret.title = title;
    if(url) ret.url = url;
    if(other) ret.other = other;
    return ret;
};
export const returnErr = (data, title, url) =>{
    let ret = {code:-1, data};
    if(title) ret.title = title;
    if(url) ret.url = url;
    return ret;
};
export const initPageState = (url, state) => ({url, state});
export const resRender = (req, res, title, state, template, otherStore) => {
    const _page = initPageState(req.originalUrl, state);
    const store = { ...otherStore, _page };
    const { app } = serverRender(req.originalUrl, store);
    res.render(template, {title: title, app: app, init: JSON.stringify(store)});
};
export default _Request;
