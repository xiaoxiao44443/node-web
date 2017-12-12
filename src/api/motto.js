/**
 * Created by xiao on 2017/6/6.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';

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

export  default {
    todayMotto,
    editTodayMotto
}