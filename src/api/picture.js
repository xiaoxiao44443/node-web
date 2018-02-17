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

const picSizeLimit = {
    blog: false,
    friend: { size: 300, width: 300, height: 300 } //300kb 压缩到300*300
};

const getFileMd5 = async filePath => {
    let c = require('crypto');
    // let start = new Date().getTime();
    let md5sum = c.createHash('md5');
    let stream = fs.createReadStream(filePath);
    stream.on('data', chunk => {
        md5sum.update(chunk);
    });
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            let str = md5sum.digest('hex').toUpperCase();
            // console.log('文件:'+filePath+',MD5签名为:'+str+'.耗时:'+(new Date().getTime()-start)/1000.00+"秒");
            resolve(str);
        });
    });
};

const getPicPath = async pic => {
    try {
        let model = new Model;
        let { results } = await model.query('SELECT * FROM ?? WHERE id = ?', [prefix + 'image', pic]);
        if(results.length > 0){
            const info = results[0];
            const realPath = path.resolve(__dirname, '../../', info.path);
            let ret = fs.existsSync(realPath) && realPath;
            return Promise.resolve(ret);
        }else{
            return Promise.resolve(false);
        }
    }catch (err){
        return Promise.reject(err);
    }
};
const savePic = async (pathname, type, author) => {
    try {
        const NOW_TIME = parseInt(Date.now() / 1000);

        if(Array.isArray(pathname)){

            let inserts = [];
            for(let i = 0; i<pathname.length; i++){
                let realPath = path.resolve(__dirname, '../../', pathname[i]);
                if(!fs.existsSync(realPath)) return Promise.reject('图片不存在');
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
            return Promise.resolve(results);

        }else{
            //图片验证
            const realPath = path.resolve(__dirname, '../../', pathname);
            if(!fs.existsSync(realPath)) return Promise.reject('图片不存在');
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
            return Promise.resolve(results.affectedRows >= 1);
        }

    }catch (err){
        return Promise.reject(err);
    }
};

const getPicsByType = async (type, author ,option, status = 0) => {
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
        let { results } = await model.query(`SELECT id FROM ?? WHERE type = ? AND author = ? AND status = ? ORDER BY create_time desc LIMIT ${page}`, [prefix + 'image', type, author, status]);
        return Promise.resolve(results);
    }catch (err){
        return Promise.reject(err);
    }
};

//假删除
const deletePic = async pic => {
    try {
        let model = new Model;

        let { results } = await model.query(`UPDATE ?? SET status = -1 WHERE id = ? AND status = 0`, [prefix + 'image', pic]);
        return Promise.resolve(results.affectedRows >= 1);
    } catch (err) {
        return Promise.reject(err);
    }
};

//图片压缩
const compress = (files, type) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filesPath = [];
            for(let i = 0; i < files.length; i++){
                let _path = files[i].path;
                filesPath.push(_path);
                if (type != picType.friend) return resolve(filesPath);
                const { size, width, height } = picSizeLimit.friend;
                if (size && files[i].size / 1024 > size){
                    try {
                        const sharp = require('sharp');
                        const image = sharp(_path);
                        await image.metadata();
                        const moment = require('moment');
                        const _tmpPath = require('path').resolve(_path, '..')
                            + '/_tmp'+ moment().format('YYYYMMDDHHssSSS');
                        await image.resize(width, height).toFile(_tmpPath);
                        const fse = require('fs-extra');
                        fse.moveSync(_tmpPath, _path, { overwrite: true });
                    } catch (err) {
                        //
                    }
                }
            }
            resolve(filesPath);
        } catch (err) {
            reject(err);
        }
    });
};

export  default {
    getPicPath,
    savePic,
    picType,
    picSizeLimit,
    compress,
    getPicsByType,
    deletePic
}