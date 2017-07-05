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

    let { results } = await model.query(`SELECT id,title,summary,main_img,tags,views,comments,categroy,create_time,edit_time,stick FROM ?? WHERE status = 0 ORDER BY create_time desc,stick desc LIMIT ${page}`, [prefix + 'article']);
    return new Promise((resolve, reject) => {
        resolve(results);
    });
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

    let { results } = await model.query(`SELECT id,author,title,views,comments,create_time,stick FROM ?? WHERE status = 0 ORDER BY create_time desc,stick desc LIMIT ${page}`, [prefix + 'article']);
    return new Promise((resolve, reject) => {
        resolve(results);
    });
};

//获取指定文章
const getArticle = async id => {
    let model = new Model;
    let { results } = await model.query(`SELECT * FROM ?? WHERE id = ?`, [prefix + 'article', id]);
    return new Promise((resolve, reject) => {
        resolve(results.length > 0 ? results[0] : false);
    });
};

//编辑文章
const saveArticle = async (id, article) => {
    let model = new Model;
    let updates = {
        title: article.title,
        text: article.text,
        summary: article.summary,
        main_img: article.main_img,
        edit_time: Math.round(Date.now() / 1000),
        categroy: article.categroy,
        stick: article.stick,
        tags: article.tags
    };
    let { results } = await model.query(`UPDATE ?? SET ? WHERE id = ?`, [prefix + 'article', updates, id]);
    return new Promise((resolve, reject) => {
        resolve( results.affectedRows >=0);
    });
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
        main_img: article.main_img,
        tags: article.tags,
        views: 0,
        comments: 0,
        categroy: 0,
        create_time: NOW_TIME,
        edit_time: NOW_TIME,
        status: 0,
        stick:0
    };
    let { results } = await model.query(`INSERT INTO ?? SET ?`, [prefix + 'article', insert]);
    return new Promise((resolve, reject) => {
        resolve( results.affectedRows >=0);
    });
};

//删除文章(假删除)
const deleteArticle = async id => {
    let model = new Model;
    let { results } = await model.query(`UPDATE ?? SET status = -1 WHERE id = ?`, [prefix + 'article', id]);
    return new Promise((resolve, reject) => {
        resolve(results.affectedRows >=1);
    });
};

//删除文章(真删除)
const deleteArticleZ = id => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query('DELETE FROM ?? WHERE id = ?',  [prefix + 'article', id]);
            resolve(results.affectedRows >=1);
        }catch (err){
            reject(err);
        }
    });
};

//文章阅读次数+1
const articleViewAdd = id => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query(`UPDATE ?? SET views = views + 1 WHERE id = ?`, [prefix + 'article', id]);
            resolve(results.affectedRows >=1);
        }catch (err){
            reject(err);
        }
    });
};

//文章评论数+1
const articleCommentsAdd = id => {
    return new Promise(async(resolve, reject) => {
        try {
            let model = new Model;
            let { results } = await model.query(`UPDATE ?? SET comments = comments + 1 WHERE id = ?`, [prefix + 'article', id]);
            resolve(results.affectedRows >=1);
        }catch (err){
            reject(err);
        }
    });
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