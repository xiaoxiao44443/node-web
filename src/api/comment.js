/**
 * Created by xiao on 2017/5/17.
 */
import { dbConfig, commentConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';
import sqlString from '../tool/utils/sqlstring';
import moment from 'moment';

//分页查询评论
const query = async (type, type_key, option) => {
    try {
        const _default = {
            p: 1,
            size: 10
        };
        let _option = option || _default;
        //计算分页
        let { p, size } = _option;
        p = parseInt(p >= 1 ? p : _default.p);
        size = parseInt(size >=1 ? size : _default.size);

        let page = `${(p - 1)*size},${size}`;
        let model = new Model;
        let sql;
        if(type_key === false){
            sql = sqlString.format('SELECT c.id,c.content,u.nickname,u.head as user_head,u.profile_url,u.account_type,c.type,c.type_key,c.comment_id,c.reply_id,c.create_time FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.type = ? AND c.comment_id = 0 AND c.reply_id = 0 ORDER BY create_time desc,stick desc' + ` LIMIT ${page};`,
                [prefix + 'comment', prefix + 'user', type]);
        }else{
            sql = sqlString.format(`SELECT c.id,c.content,u.nickname,u.head as user_head,u.profile_url,u.account_type,c.type,c.type_key,c.comment_id,c.reply_id,c.create_time FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.type = ? AND c.type_key = ? AND c.comment_id = 0 AND c.reply_id = 0 ORDER BY create_time desc,stick desc` + ` LIMIT ${page};`,
                [prefix + 'comment', prefix + 'user', type, type_key]);
        }

        let { results: list } = await model.query(sql);  //分页数据

        model = new Model;
        if(type_key === false){
            sql = sqlString.format('SELECT count(*) as lo_count FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.type = ? AND c.comment_id = 0 AND c.reply_id = 0',
                [prefix + 'comment', prefix + 'user', type]);
        }else{
            sql = sqlString.format(`SELECT count(*) as lo_count FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.type = ? AND c.type_key = ? AND c.comment_id = 0 AND c.reply_id = 0`,
                [prefix + 'comment', prefix + 'user', type, type_key]);
        }
        let { results } = await model.query(sql);

        let count = results[0]['lo_count'];

        const ret = {
            count,
            pageSize: size,
            maxPage: Math.ceil(count / size),
            nowPage: p,
            list
        };
        return Promise.resolve(ret);

    }catch(err){
        return Promise.reject(err);
    }
};

//分页查询回复
const queryReply = async (id, option) => {
    try {
        const _default = {
            p: 1,
            size: 10
        };
        let _option = option || _default;
        //计算分页
        let { p, size } = _option;
        p = parseInt(p >= 1 ? p : _default.p);
        size = parseInt(size >=1 ? size : _default.size);

        let page = `${(p - 1)*size},${size}`;
        let model = new Model;
        let sql = sqlString.format('SELECT c.id,c.content,u.nickname,u.head as user_head,u.profile_url,u.account_type,c.type,c.type_key,c.comment_id,c.reply_id,c.create_time FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.comment_id = ? ORDER BY create_time asc,stick desc' + ` LIMIT ${page};`,
            [prefix + 'comment', prefix + 'user', id]);

        let { results: list } = await model.query(sql);  //分页数据

        model = new Model;
        sql = sqlString.format(`SELECT count(*) as lo_count FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 AND c.comment_id = ?`,
            [prefix + 'comment', prefix + 'user', id]);
        let { results } = await model.query(sql);

        let count = results[0]['lo_count'];

        const ret = {
            count,
            pageSize: size,
            maxPage: Math.ceil(count / size),
            nowPage: p,
            list
        };
        return Promise.resolve(ret);

    }catch(err){
        return Promise.reject(err);
    }
};

//发表评论
const send = async (type, type_key, user_id, content) => {
    try {
        let model = new Model;
        const insert = {
            content: content,
            user_id: user_id,
            type: type,
            type_key: type_key,
            comment_id: 0,
            reply_id: 0,
            create_time: parseInt(Date.now() / 1000),
            status: 0,
            stick: 0
        };
        let { results } = await model.query('INSERT INTO ?? SET ?', [prefix + 'comment', insert]);
        return Promise.resolve(results.affectedRows >0);

    }catch (err){
        return Promise.reject(err);
    }
};

//发表评论间隔和发帖总数限制
const sendLimit = async user_id => {
    try {
        let model = new Model;

        if(!commentConfig.enable) return Promise.resolve(true);

        const { interval, limitInterval, limit } = commentConfig;
        const NOW_TIME = parseInt(Date.now() / 1000);

        //时间间隔内发表量限制
        //间隔判断
        let t, ret, results;
        t = parseInt(moment(NOW_TIME * 1000).subtract(limitInterval, 'ms').valueOf()) / 1000;
        ret = await model.query('SELECT count(*) as lo_count FROM ?? WHERE user_id = ? AND create_time >= ?', [prefix + 'comment', user_id, t]);
        results = ret.results;
        if(results['lo_count'] >= limit){
            return Promise.resolve(commentConfig.limitInterval_msg);
        }

        //间隔判断
        model = new Model;
        t = parseInt(moment(NOW_TIME * 1000).subtract(interval, 'ms').valueOf()) / 1000;
        ret = await model.query('SELECT count(*) as lo_count FROM ?? WHERE user_id = ? AND create_time >= ?', [prefix + 'comment', user_id, t]);
        results = ret.results;
        if(results['lo_count'] > 0){
            return Promise.resolve(commentConfig.interval_msg);
        }
        return Promise.resolve(true);
    }catch (err){
        return Promise.reject(err);
    }
};

//回复评论
const reply = async (comment_id, reply_id, user_id, content) => {
    try {
        let model = new Model, ret, results;
        //查询type 与 type_key
        ret = await model.query('SELECT * FROM ?? WHERE id = ? AND status = 0', [prefix + 'comment', comment_id]);
        results = ret.results;
        if(results.length == 0){
            return Promise.resolve(false);
        }
        const { type, type_key } = results[0];

        const insert = {
            content: content,
            user_id: user_id,
            type: type,
            type_key: type_key,
            comment_id: comment_id,
            reply_id: reply_id,
            create_time: parseInt(Date.now() / 1000),
            status: 0,
            stick: 0
        };
        model = new Model;
        ret = await model.query('INSERT INTO ?? SET ?', [prefix + 'comment', insert]);
        results = ret.results;
        return Promise.resolve(results.affectedRows >0);

    }catch (err){
        return Promise.reject(err);
    }
};

//删除留言(假删除)
const deleteComment = async (id) => {

};

//最新回复列表
const newCommentList = async (size = 5) => {
    try {
        let model = new Model;

        let { results } = await model.query(`SELECT c.id,c.content,c.type,c.type_key,c.comment_id,c.reply_id,c.create_time,u.nickname,u.head as user_head,u.profile_url,u.account_type FROM ?? AS c LEFT JOIN ?? AS u ON c.user_id = u.id WHERE c.status = 0 ORDER BY create_time desc LIMIT 0,${size}`, [prefix + 'comment', prefix + 'user']);
        return Promise.resolve(results);
    }catch (err){
        return Promise.reject(err);
    }
};

//根据回复查找到指定评论页码
const queryByComment = async (id, commentSize = 10, replySize = 5 ) => {
    try {
        let model = new Model(false);
        let { results } = await model.query(`SELECT * FROM ?? WHERE id = ? AND status = 0 LIMIT 1`, [prefix + 'comment', id]);
        if (results.length == 0) {
            await model.end();
            return Promise.resolve(false);
        }
        let comment = results[0];
        if (comment.comment_id == 0) {
            //这是评论，计算评论在第几页
            const comment_id = comment.id;
            const type_key = comment.type_key;
            //统计评论数
            let { results: count_comment_res } = await model.query(`SELECT COUNT(*) AS lo_count FROM ?? WHERE type_key = ? AND comment_id = 0 AND status = 0 AND id <= ?`, [prefix + 'comment', type_key, comment_id]);
            const comment_count = count_comment_res[0]['lo_count'];
            //计算页数
            const comment_page = Math.ceil(comment_count / commentSize);
            await model.end();
            return Promise.resolve({ comment_page, reply_page: 0, comment_id });
        } else {
            //这是回复，计算他的父级评论在第几页，计算他在回复中占第几页
            const comment_id = comment.comment_id;
            const reply_id = comment.id;
            let { results } = await model.query(`SELECT * FROM ?? WHERE id = ? AND status = 0 LIMIT 1`, [prefix + 'comment', comment_id]);
            if (results.length == 0) {
                await model.end();
                return Promise.resolve(false);
            }
            comment = results[0];
            const type_key = comment.type_key;
            //统计在该评论前的评论数
            let { results: count_comment_res } = await model.query(`SELECT COUNT(*) AS lo_count FROM ?? WHERE type_key = ? AND comment_id = 0 AND status = 0 AND id <= ?`, [prefix + 'comment', type_key, comment_id]);
            const comment_count = count_comment_res[0]['lo_count'];
            //统计在该回复前的回复数
            let { results: count_reply_res } = await model.query(`SELECT COUNT(*) AS lo_count FROM ?? WHERE type_key = ? AND comment_id = ? AND status = 0 AND id <= ?`, [prefix + 'comment', type_key, comment_id, reply_id]);
            const reply_count = count_reply_res[0]['lo_count'];
            //计算页数
            const comment_page = Math.ceil(comment_count / commentSize);
            const reply_page = Math.ceil(reply_count / replySize);
            await model.end();
            return Promise.resolve({ comment_page, reply_page, comment_id });
        }
    } catch (err) {
        return Promise.reject(err);
    }
};

export default {
    query,
    queryReply,
    send,
    reply,
    deleteComment,
    sendLimit,
    newCommentList,
    queryByComment
}