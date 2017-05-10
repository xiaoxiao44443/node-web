/**
 * Created by xiao on 2017/5/10.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import path from 'path';
import fs from 'fs';

const getPicPath = pic => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query(`SELECT * FROM ?? WHERE id = ?`, [prefix + 'image', pic]);
            if(results.length > 0){
                const info = results[0];
                const realPath = path.resolve(__dirname, '../../', info.path);
                let ret = fs.existsSync(realPath) && realPath;
                resolve(ret);
            }else{
                resolve(false);
            }
        }catch (err){
            reject(err);
        }

    });
};
export  {
    getPicPath
}