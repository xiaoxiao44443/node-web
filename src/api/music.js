/**
 * Created by xiao on 2018/2/15.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import configApi from "./config";

//音乐列表
const queryMusicList = async () => {
    try {
        let model = new Model;
        let { results } = await model.query('SELECT * FROM ??', [prefix + 'music']);
        return Promise.resolve(results);
    }catch (err){
        return Promise.reject(err);
    }
};

//添加音乐
const addMusic = async music => {
    try {
        let model = new Model;
        const NOW_TIME = Math.round(Date.now() / 1000);
        let insert = {
            caption: music.caption,
            author: music.author,
            cover: music.cover,
            src: music.src,
            create_time: NOW_TIME,
        };
        let { results } = await model.query(`INSERT INTO ?? SET ?`, [prefix + 'music', insert]);
        return Promise.resolve(results.affectedRows >=0);
    }catch (err){
        return Promise.reject(err);
    }
};


//删除音乐
const deleteMusic = async id => {
    try {
        let model = new Model;
        let { results } = await model.query('DELETE FROM ?? WHERE id = ? LIMIT 1', [prefix + 'music', id]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};

//修改音乐
const editMusic = async (id, music) => {
    try {
        let model = new Model;
        let updates = {
            caption: music.caption,
            author: music.author,
            cover: music.cover,
            src: music.src
        };
        let { results } = await model.query(`UPDATE ?? SET ? WHERE id = ?`, [prefix + 'music', updates, id]);
        return Promise.resolve(results.affectedRows >=0);
    }catch (err){
        return Promise.reject(err);
    }
};

//获取音乐盒信息
const getMusicInfo = async () => {
    try {
        const musicList = await queryMusicList();
        const musicConfig = await configApi.music();
        return Promise.resolve({
            _music: {
                mode: parseInt(musicConfig.mode.value), // 0:列表循环 1:随机播放 2:单曲循环,
                audioIndex: parseInt(musicConfig.audio_index.value),
                list: musicList
            }
        });
    }catch (err) {
        return Promise.reject(err);
    }
};

//获取单首歌曲信息
const getMusic = async id => {
    try {
        let model = new Model;
        let { results } = await model.query('SELECT * FROM ?? WHERE id = ? LIMIT 1', [prefix + 'music', id]);
        return Promise.resolve(results.length > 0 ? results[0] : false);
    }catch (err){
        return Promise.reject(err);
    }
};

export  default {
    queryMusicList,
    addMusic,
    deleteMusic,
    editMusic,
    getMusicInfo,
    getMusic
}
