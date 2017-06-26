/**
 * Created by xiao on 2017/6/6.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';

const todayMotto = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query('SELECT * FROM ?? WHERE used = 1 LIMIT 1', [prefix + 'motto']);
            resolve(results.length == 1 ? results[0] : {text: ''});
        }catch (err){
            reject(err);
        }
    })
};

const editTodayMotto = motto => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            const update = {
                text: motto,
                update_time: parseInt(Date.now() / 1000)
            };
            let { results } = await model.query('UPDATE ?? SET ?  WHERE used = 1 LIMIT 1', [prefix + 'motto', update]);
            resolve(results.affectedRows >=0);
        }catch (err){
            reject(err);
        }
    })
};

export  default {
    todayMotto,
    editTodayMotto
}