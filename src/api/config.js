/**
 * Created by xiao on 2017/5/11.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import { getKeyInObject } from '../tool/utils/object';

const website = async () => {

    let model = new Model;
    let { results } = await model.query(`SELECT * FROM ?? WHERE name = 'website'`, [prefix + 'config']);
    return new Promise((resolve, reject) => {
        const value = getKeyInObject(results,'0.value');
        if(value){
            resolve(JSON.parse(value));
        }else{
            reject(new Error('网站配置获取失败!'));
        }
    });
};
const updateWebsite = async websiteConfig => {

    let model = new Model;
    let { results } = await model.query(`UPDATE ?? SET value = ? WHERE name = 'website'`, [prefix + 'config', JSON.stringify(websiteConfig)]);
    return new Promise((resolve, reject) => {
        resolve(results.affectedRows >=1);
    });
};

const Api = {
    website,
    updateWebsite
};
export  default Api;