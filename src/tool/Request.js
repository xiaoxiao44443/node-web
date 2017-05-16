/**
 * Created by xiao on 2017/5/6.
 */
import express from 'express';
import configApi from '../api/config';
import serverRender from './server-render';

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
                        throw new TypeError('Requset.use() requires middleware functions');
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

export const returnSuc = (data, title, url) =>{
    let ret = {code:0, data};
    if(title) ret.title = title;
    if(url) ret.url = url;
    return ret;
};
export const returnErr = (data, title, url) =>{
    let ret = {code:-1, data};
    if(title) ret.title = title;
    if(url) ret.url = url;
    return ret;
};
export const initPageState = (url, state) => ({url, state});
export const resRender = (req, res, title, state, template) => {
    const _page = initPageState(req.originalUrl, state);
    const store = { _page };
    const { app } = serverRender(req.originalUrl, store);
    res.render(template, {title: title, app: app, init: JSON.stringify(store)});
};
export default _Request;
