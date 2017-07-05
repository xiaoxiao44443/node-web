/**
 * Created by xiao on 2017/5/10.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import path from 'path';
import fs from 'fs';
import sqlString from '../tool/utils/sqlstring';

const picType = {
    blog: 1,
    friend: 2
};


const getFileMd5 = filePath => {
    return new Promise((resolve, reject) => {
        let c = require('crypto');
        // let start = new Date().getTime();
        let md5sum = c.createHash('md5');
        let stream = fs.createReadStream(filePath);
        stream.on('data', chunk => {
            md5sum.update(chunk);
        });
        stream.on('end', () => {
            let str = md5sum.digest('hex').toUpperCase();
            // console.log('文件:'+filePath+',MD5签名为:'+str+'.耗时:'+(new Date().getTime()-start)/1000.00+"秒");
            resolve(str);
        });
    });


};

const getPicPath = pic => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query('SELECT * FROM ?? WHERE id = ?', [prefix + 'image', pic]);
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
const savePic = (pathname, type, author) => {
    return new Promise(async(resolve, reject) => {
        try {
            const NOW_TIME = parseInt(Date.now() / 1000);

            if(Array.isArray(pathname)){

                let inserts = [];
                for(let i = 0; i<pathname.length; i++){
                    let realPath = path.resolve(__dirname, '../../', pathname[i]);
                    if(!fs.existsSync(realPath)) return reject('图片不存在');
                    let md5 = await getFileMd5(realPath);
                    let insert = {
                        path: pathname[i],
                        type: type,
                        author: author,
                        md5: md5,
                        create_time: NOW_TIME
                    };
                    inserts += sqlString.format('INSERT INTO ?? SET ?', [prefix + 'image', insert]) + ';'
                }
                let model = new Model(true, true);
                let { results } = await model.query(inserts);
                resolve(results);

            }else{
                //图片验证
                const realPath = path.resolve(__dirname, '../../', pathname);
                if(!fs.existsSync(realPath)) return reject('图片不存在');
                let md5 = await getFileMd5(realPath);

                let model = new Model;
                const insert = {
                    path: pathname,
                    type: type,
                    author: author,
                    md5: md5,
                    create_time: NOW_TIME
                };
                let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'image', insert]);
                resolve(results.affectedRows >= 1);
            }

        }catch (err){
            reject(err);
        }
    })
};

const getPicsByType = (type, author ,option) => {
    return new Promise(async(resolve, reject) => {
        try {
            const _default = {
                p: 1,
                size: 50
            };
            let _option = option || _default;
            let model = new Model;
            //计算分页
            let { p, size } = _option;
            p = parseInt(p >= 1 ? p : _default.p);
            size = parseInt(size >=1 ? size : _default.size);

            let page = `${(p - 1)*size},${size}`;
            let { results } = await model.query(`SELECT id FROM ?? WHERE type = ? AND author = ? ORDER BY create_time desc LIMIT ${page}`, [prefix + 'image', type, author]);
            resolve(results);
        }catch (err){
            reject(err);
        }
    });
};
export  default {
    getPicPath,
    savePic,
    picType,
    getPicsByType
}