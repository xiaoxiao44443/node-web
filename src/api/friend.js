/**
 * Created by xiao on 2017/7/5.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';

//友情链接分页查询
const queryFriend = async option => {
    try {
        const _default = {
            p: 1,
            size: 10
        };
        let _option = option || _default;
        let model = new Model;
        //计算分页
        let { p, size } = _option;
        p = parseInt(p >= 1 ? p : _default.p);
        size = parseInt(size >=1 ? size : _default.size);

        let page = `${(p - 1)*size},${size}`;

        let { results } = await model.query(`SELECT id,friend_name,blog_name,blog_url,blog_motto,friend_head,create_time,update_time,display_order FROM ?? WHERE status = 0 ORDER BY display_order desc,create_time desc LIMIT ${page}`, [prefix + 'friend']);
        return Promise.resolve(results);
    }catch (err){
        return Promise.reject(err);
    }
};

//添加友情链接
const addFriend = async friend => {
    try {
        let model = new Model;
        let NOW_TIME = Math.round(Date.now() / 100);
        let insert = {
            friend_name: friend.friend_name,
            blog_name: friend.blog_name,
            blog_url: friend.blog_url,
            blog_motto: friend.blog_motto,
            friend_head: friend.friend_head,
            create_time: NOW_TIME,
            update_time: NOW_TIME,
            status: 0,
            display_order: friend.display_order
        };

        let { results } = await model.query(`INSERT INTO ?? SET ?`, [prefix + 'friend', insert]);

        return Promise.resolve(results.affectedRows >=0)

    }catch (err){
        return Promise.reject(err);
    }
};

//获取指定友情链接
const getFriend = async () => {
    try {
        let model = new Model;
        let { results } = await model.query(`SELECT * FROM ?? WHERE id = ?`, [prefix + 'friend', id]);
        return Promise.resolve(results.length > 0 ? results[0] : false);
    }catch (err){
        return Promise.reject(err);
    }
};

//编辑友情链接
const editFriend = async friend => {
    try {
        let model = new Model;
        let updates = {
            friend_name: friend.friend_name,
            blog_name: friend.blog_name,
            blog_url: friend.blog_url,
            blog_motto: friend.blog_motto,
            friend_head: friend.friend_head,
            update_time: Math.round(Date.now() / 100),
            display_order: friend.display_order
        };

        let { results } = await model.query(`UPDATE ?? SET ? WHERE id = ?`, [prefix + 'friend', updates, id]);

        return Promise.resolve(results.affectedRows >=0)

    }catch (err){
        return Promise.eject(err);
    }
};

//删除友情链接(假删除)
const deleteFriend = async id => {
    try {
        let model = new Model;
        let { results } = await model.query(`UPDATE ?? SET status = -1 WHERE id = ?`, [prefix + 'friend', id]);
        return Promise.resolve(results.affectedRows >=1 );
    }catch (err){
        return Promise.reject(err);
    }
};

//删除友情链接(真删除)
const deleteFriendZ = async id => {
    try {
        let model = new Model;
        let { results } = await model.query('DELETE FROM ?? WHERE id = ?',  [prefix + 'friend', id]);
        return Promise.resolve(results.affectedRows >=1 );
    }catch (err){
        return Promise.reject(err);
    }
};

export default {
    queryFriend,
    addFriend,
    getFriend,
    editFriend,
    deleteFriend,
    deleteFriendZ
}