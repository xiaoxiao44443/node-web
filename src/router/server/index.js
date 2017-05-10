/**
 * Created by xiao on 2017/2/26.
 */
import serverRender from '../../tool/server-render';
import Model from '../../tool/Model';
import Request, {
    router,
    returnSuc,
    returnErr
} from '../../tool/Request';
import defaultDbSql from '../../config/defaultDbSql';
import { getPicPath } from '../../api/picture';
import articleApi from '../../api/article';
import configApi from '../../api/config';

//api/pic
router.get('/api/pic([0-9]+)', async(req, res, next) => {
    const pic = req.params[0];
    try {
        let realPath = await getPicPath(pic);
        if(realPath){
            res.sendFile(realPath);
        }else{
            next();
        }
    }catch (ex){
        next(ex);
    }
});

router.get('/config', async(req, res, next) => {
    try {
        const socket = function(msg){console.log(msg)};
        const { createTable, insert }  = defaultDbSql;
        let model = new Model(false);
        for (let i = 0; i < createTable.length; i++){
            socket(`正在创建${createTable[i].desc}...`);
            await model.query(createTable[i].sql);
        }
        await model.startTrans();
        for(let i = 0; i < insert.length; i++){
            socket(`正在初始化${insert[i].desc}...`);
            await model.query(insert[i].sql);
        }
        await model.commit();
        await model.end();
        socket('初始化成功');

        res.send('初始化成功');
    }catch (ex){
        next(ex);
    }
});



//index
router.get('/', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = await configApi.website();
        const site_name = websiteConfig.site_name.value;
        if(Request.REQUEST_JSON){
            res.json(returnSuc({}, `${site_name}`));
        }else{
            const store  = {};
            const { app } = serverRender(req.url, store);
            res.render('index', {title: '洛哩哩~', app: app, init: JSON.stringify(store)});
        }

    }catch (ex){
        next(ex);
    }

});

//blog
router.get('/blog', async(req, res, next) => {

    try {
        //获取网站配置
        const websiteConfig = await configApi.website();
        const site_name = websiteConfig.site_name.value;
        //获取文章列表数据
        if(Request.REQUEST_JSON){
            const p  = req.query.p;
            let articles = await articleApi.query_article({p});
            res.json(returnSuc(articles, `${site_name}|博客`));
        }else{
            let articles = await articleApi.query_article();
            const store = {articles: articles};
            const { app } = serverRender(req.url, store);
            res.render('index', {title: `${site_name}|博客`, app: app, init: JSON.stringify(store)});
        }

    }catch (ex){
        next(ex);
    }
});


//article
router.get('/blog/ad([0-9]+)', async(req, res, next) => {
    const ad = req.params[0];

    //获取指定文章
    try {
        const model = new Model;
        const ret = await model.query('SELECT * FROM article WHERE id = ' + ad);
        const article = ret.results[0];
        if(typeof article === 'undefined'){
            return next(new Error('没有该文章'));
        }
        if(Request.REQUEST_JSON){
            res.json(returnSuc(article));
        }else{
            const store = {article_detail: article};
            const { app } = serverRender(req.url, store);
            res.render('index', {title: article.title, app: app, init: JSON.stringify(store)});
        }
    }catch (ex){
        next(ex);
    }

});


export default router;