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
    //获取文章列表数据
    try {

        let model = new Model;
        let ret = await model.query("SELECT value FROM `lo_config` WHERE name='website'");
        const xx = ret.results[0].value;
        console.log(JSON.parse(xx));
        if(Request.REQUEST_JSON){
            next();
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
    //获取文章列表数据
    try {
        const model = new Model;
        const ret = await model.query('SELECT * FROM article LIMIT 0,20');
        const articles = ret.results;

        if(Request.REQUEST_JSON){
            res.json(returnSuc(articles));
        }else{
            const store = {articles: articles};
            const { app } = serverRender(req.url, store);
            res.render('index', {title: '洛哩哩~|博客', app: app, init: JSON.stringify(store)});
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