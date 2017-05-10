/**
 * Created by xiao on 2017/5/11.
 */
import { dbConfig } from '../config';
const prefix = dbConfig.prefix;
import Model from '../tool/Model';

const query_article = async option => {
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

const Api = {
    query_article
};
export  default Api;