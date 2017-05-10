/**
 * Created by xiao on 2017/5/6.
 */
import express from 'express';

class _Request {
    constructor(){
        this.REQUEST_JSON = false;
        this.router = express.Router();
        this.router.use((req, res, next) => {
            let accept = req.header('accept');
            this.REQUEST_JSON = accept.indexOf('application/json')!==-1;
            next();
        });
    }
}

const _Router = new _Request;

export const router = _Router.router;
export const returnSuc = (data) => ({code:0, data});
export const returnErr = (data) => ({code:-1, data});
export default _Router;

