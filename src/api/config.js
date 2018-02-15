/**
 * Created by xiao on 2017/5/11.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import { getKeyInObject } from '../tool/utils/object';

//获取配置
const getConfig = async (config_name, config_desc = '') => {
    try {
        let model = new Model;
        let { results } = await model.query(`SELECT * FROM ?? WHERE name = '${config_name}'`, [prefix + 'config']);
        const value = getKeyInObject(results,'0.value');
        if(value){
            return Promise.resolve(JSON.parse(value));
        }else{
            return Promise.reject(new Error(config_desc + '配置获取失败!'));
        }
    }catch (err){
        return Promise.reject(new Error(config_desc + '配置获取失败!'));
    }
};

//更新配置
const updateConfig = async (config_name, config) => {
    try {
        let model = new Model;
        let { results } = await model.query(`UPDATE ?? SET value = ? WHERE name = '${config_name}'`, [prefix + 'config', JSON.stringify(config)]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};

const website = () => getConfig('website', '网站');
const updateWebsite = websiteConfig => updateConfig('website', websiteConfig);

const music = () => getConfig('music', '音乐');
const updateMusic = musicConfig => updateConfig('music', musicConfig);

const Api = {
    website,
    updateWebsite,
    music,
    updateMusic
};
export  default Api;