/**
 * Created by xiao on 2017/2/26.
 */
import serverRender from '../../tool/server-render';
import Model from '../../tool/Model';
import RequestModel, {
    returnSuc,
    returnErr,
    resRender,
} from '../../tool/Request';
import defaultDbSql from '../../config/defaultDbSql';
import { getPicPath } from '../../api/picture';
import articleApi from '../../api/article';
const Request = new RequestModel;
import { cookieConfig } from '../../config';

import { createUserToken, userPassword } from '../../tool/userToken';
import userApi from '../../api/user';

//判断cookies登录
Request.get('/login',async(req, res, next) => {
    try {
        const id = req.cookies.id || 0;
        const token = req.cookies.token || '';
        const ret = await userApi.tokenLogin(id, token);
        if(ret){
            res.redirect('/admin');
        }else{
            res.clearCookie('id').clearCookie('token');
            next();
        }
    }catch (ex){
        next(ex);
    }

});

//logout
Request.get('/logout',async(req, res, next) => {
    try {
        const id = req.cookies.id || 0;
        const token = req.cookies.token || '';
        const ret = await userApi.tokenLogin(id, token);

        if(Request.REQUEST_JSON){
            if(ret) res.clearCookie('id').clearCookie('token');
            res.json(returnSuc('退出成功~', '', '/login'))
        }else{
            if(ret){
                //登录才清理cookies
                res.clearCookie('id').clearCookie('token');
            }
            res.redirect('/login');
        }
    }catch (ex){
        next(ex);
    }

});

//api/pic
Request.get('/api/pic([0-9]+)', async(req, res, next) => {
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

Request.router.get('/config', async(req, res, next) => {
    next();
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
Request.get('/', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}`;

        //初始化页面数据
        const state = {};

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'index');
        }

    }catch (ex){
        next(ex);
    }

});

//blog
Request.get('/blog', async(req, res, next) => {

    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|博客`;

        //初始化页面数据 获取文章列表数据
        let articles = await articleApi.queryArticle();
        const state  = { articles: articles };

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'index');
        }

    }catch (ex){
        next(ex);
    }
});

//get more article
Request.post('/blog', async(req, res, next) => {

    try{
        //获取网站配置

        if(Request.REQUEST_JSON){
            //初始化数据
            const p = req.body.p;

            let articles = await articleApi.queryArticle({p});
            res.json(returnSuc(articles));
        }

    }catch (ex){
        next(ex);
    }
});


//article
Request.get('/blog/ad([0-9]+)', async(req, res, next) => {

    try {
        const ad = req.params[0];

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;

        //初始化页面数据 获取文章数据
        let article = await articleApi.getArticle(ad);
        const state  = { article: article };
        if(!article) return next();

        //网站标题是文章标题
        const title = `${site_name}|${article.title}`;
        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'index');
        }

    }catch (ex){
        next(ex);
    }
});

//login页面
Request.get('/login', async(req, res, next) => {

    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|主人登录~`;

        //初始化页面数据
        const state  = {};

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'index');
        }
    }catch (ex){
        next(ex);
    }
});

//login post登录
Request.post('/login', async(req, res, next) => {

    try {

        if(Request.REQUEST_JSON){

            const account = req.body.account;
            const password = req.body.password;

            const userInfo = await userApi.userLogin(account, password);

            if(userInfo){

                //是否创建token
                const cookiesOption = {
                    maxAge: cookieConfig.maxAge //3天,
                };
                res.cookie('id',userInfo.id, cookiesOption).cookie('token', userInfo.login_token, cookiesOption);

                res.json(returnSuc('登录成功'));
            }else{
                res.clearCookie('id').clearCookie('token');
                res.json(returnErr('登录失败'));
            }


        }
    }catch (ex){
        next(ex);
    }
});


export default Request.router;