/**
 * Created by xiao on 2017/6/6.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import serverHttp from '../tool/server-http';
import moment from 'moment';

const todayMotto = async () => {
    try {
        let model = new Model;
        let { results } = await model.query('SELECT * FROM ?? WHERE used = 1 LIMIT 1', [prefix + 'motto']);
        return Promise.resolve(results.length == 1 ? results[0] : {text: ''});
    }catch (err){
        return Promise.reject(err);
    }
};

const editTodayMotto = async motto => {
    try {
        let model = new Model;
        const update = {
            text: motto,
            update_time: parseInt(Date.now() / 1000)
        };
        let { results } = await model.query('UPDATE ?? SET ?  WHERE used = 1 LIMIT 1', [prefix + 'motto', update]);
        return Promise.resolve(results.affectedRows >=0);
    }catch (err){
        return Promise.reject(err);
    }
};

const autoSyncMotto = () => {
    let last_sync_date = '';
    console.log('开启格言同步 ' + moment().format('YYYY-MM-DD HH:mm'));
    //一天只执行一次
    return setInterval( async () => {
        let date = new Date();
        if (date.getHours() == 0 && date.getMinutes() == 0 && last_sync_date != date.getDate()) {
            last_sync_date = date.getDate();
            try {
                await syncMotto();
                console.log('每日同步格言成功 ' + moment().format('YYYY-MM-DD HH:mm'));
            } catch (e) {
                console.log('每日同步格言失败 ' + moment().format('YYYY-MM-DD HH:mm'));
            }
    }
    }, 1000);
};

//同步一言
const syncMotto = async () => {
    try {
        let ret = await serverHttp.apiGet('https://v1.hitokoto.cn/?c=a');
        const motto = ret.hitokoto + `<br><span>by ${ret.from}</span>`;
        ret = await editTodayMotto(motto);
        if (ret) {
            return Promise.resolve('更新格言成功');
        } else {
            return Promise.reject('更新格言失败');
        }
    } catch (err) {
        return Promise.reject(err);
    }
};

export  default {
    todayMotto,
    editTodayMotto,
    autoSyncMotto
}