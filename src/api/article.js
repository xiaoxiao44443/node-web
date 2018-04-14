/**
 * Created by xiao on 2017/5/11.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';

//文章分页查询
const queryArticle = async option => {
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

    let { results } = await model.query(`SELECT id,title,summary,main_img,tags,views,comments,category,create_time,edit_time,stick FROM ?? WHERE status = 0 ORDER BY create_time desc,stick desc LIMIT ${page}`, [prefix + 'article']);
    return Promise.resolve(results);
};

//文章分页查询后台版
const queryArticleAdmin = async option => {
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
    let t1 = prefix + 'article';
    let t2 = prefix + 'user';

    let { results } = await model.query(`SELECT ${t1}.id,author author_id,${t2}.nickname author,title,views,comments,${t1}.create_time,stick FROM ${t1} JOIN ${t2} ON ${t1}.author = ${t2}.id WHERE status = 0 ORDER BY create_time desc,stick desc LIMIT ${page}`);
    return Promise.resolve(results);
};

//获取指定文章
const getArticle = async id => {
    let model = new Model;
    let { results } = await model.query(`SELECT * FROM ?? WHERE id = ?`, [prefix + 'article', id]);
    return Promise.resolve(results.length > 0 ? results[0] : false);
};

//编辑文章
const saveArticle = async (id, article) => {
    let model = new Model;
    let updates = {
        title: article.title,
        text: article.text,
        summary: article.summary,
        main_img: article.main_img ? article.main_img : 0,
        edit_time: Math.round(Date.now() / 1000),
        category: article.category,
        stick: article.stick,
        tags: article.tags
    };
    let { results } = await model.query(`UPDATE ?? SET ? WHERE id = ?`, [prefix + 'article', updates, id]);
    return Promise.resolve(results.affectedRows >=0);
};

//发布文章
const publishArticle = async article => {
    let model = new Model;
    const NOW_TIME = Math.round(Date.now() / 1000);
    let insert = {
        author: article.author,
        title: article.title,
        summary: article.summary,
        text: article.text,
        main_img: article.main_img ? article.main_img : 0,
        tags: article.tags,
        views: 0,
        comments: 0,
        category: 0,
        create_time: NOW_TIME,
        edit_time: NOW_TIME,
        status: 0,
        stick:0
    };
    let { results } = await model.query(`INSERT INTO ?? SET ?`, [prefix + 'article', insert]);
    return Promise.resolve(results.affectedRows >=0);
};

//删除文章(假删除)
const deleteArticle = async id => {
    let model = new Model;
    let { results } = await model.query(`UPDATE ?? SET status = -1 WHERE id = ?`, [prefix + 'article', id]);
    return Promise.resolve(results.affectedRows >=1);
};

//删除文章(真删除)
const deleteArticleZ = async id => {
    try {
        let model = new Model;
        let { results } = await model.query('DELETE FROM ?? WHERE id = ?',  [prefix + 'article', id]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};

//文章阅读次数+1
const articleViewAdd = async id => {
    try {
        let model = new Model;
        let { results } = await model.query(`UPDATE ?? SET views = views + 1 WHERE id = ?`, [prefix + 'article', id]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};

//文章评论数+1
const articleCommentsAdd = async id => {
    try {
        let model = new Model;
        let { results } = await model.query(`UPDATE ?? SET comments = comments + 1 WHERE id = ?`, [prefix + 'article', id]);
        return Promise.resolve(results.affectedRows >=1);
    }catch (err){
        return Promise.reject(err);
    }
};


const Api = {
    queryArticle,
    getArticle,
    queryArticleAdmin,
    saveArticle,
    publishArticle,
    deleteArticle,
    deleteArticleZ,
    articleViewAdd,
    articleCommentsAdd
};
export default Api;