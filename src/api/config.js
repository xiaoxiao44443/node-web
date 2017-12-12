/**
 * Created by xiao on 2017/5/11.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import { getKeyInObject } from '../tool/utils/object';

const website = async () => {

    try {
        let model = new Model;
        let { results } = await model.query(`SELECT * FROM ?? WHERE name = 'website'`, [prefix + 'config']);
        const value = getKeyInObject(results,'0.value');
        if(value){
            return Promise.resolve(JSON.parse(value));
        }else{
            return Promise.reject(new Error('网站配置获取失败!'));
        }
    }catch (err){
        return Promise.reject(new Error('网站配置获取失败!'));
    }
};
const updateWebsite = async websiteConfig => {

    try {
        let model = new Model;
        let { results } = await model.query(`UPDATE ?? SET value = ? WHERE name = 'website'`, [prefix + 'config', JSON.stringify(websiteConfig)]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};

const Api = {
    website,
    updateWebsite
};
export  default Api;