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

    let { results } = await model.query(`SELECT * FROM ?? WHERE status = 0 ORDER BY create_time desc,stick desc LIMIT ${page}`, [prefix + 'article']);
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
        resolve(results[0]);
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
        edit_time: Date.now() / 1000,
        categroy: article.categroy,
        stick: article.stick,
        tags: article.tags
    };
    let { results } = await model.query(`UPDATE ?? SET ? WHERE id = ?`, [prefix + 'article', updates, id]);
    return new Promise((resolve, reject) => {
        resolve(results.affectedRows >=0 );
    });
};

//发布文章
const publishArticle = async article => {
    let model = new Model;
    const NOW_TIME = Date.now() / 1000;
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
        resolve(results.affectedRows >=0 );
    });
};

//删除文章
const deleteArticle = async id => {
    let model = new Model;

    let { results } = await model.query(`UPDATE ?? SET status = -1 WHERE id = ?`, [prefix + 'article', id]);
    return new Promise((resolve, reject) => {
        resolve(results.affectedRows >=1 );
    });
};

const Api = {
    queryArticle,
    getArticle,
    queryArticleAdmin,
    saveArticle,
    publishArticle,
    deleteArticle
};
export default Api;