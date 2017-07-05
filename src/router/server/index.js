/**
 * Created by xiao on 2017/2/26.
 */
import Model from '../../tool/Model';
import RequestModel, {
    returnSuc,
    returnErr,
    resRender,
} from '../../tool/Request';
import defaultDbSql from '../../config/defaultDbSql';
import pictureApi from '../../api/picture';
import articleApi from '../../api/article';
const Request = new RequestModel;
import { cookieConfig, wbApp } from '../../config';
import userApi from '../../api/user';
import commentApi from '../../api/comment';
import mottoApi from '../../api/motto';
import serverHttp from '../../tool/server-http';

//判断cookies登录
Request.get('/login',async(req, res, next) => {
    try {
        if(Request.USER.id && Request.USER.group_id == 1){
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
        if(Request.REQUEST_JSON){
            if(Request.USER.id) res.clearCookie('id').clearCookie('token');
            res.json(returnSuc('退出成功~', '', '/login'))
        }else{
            if(Request.USER.id){
                //登录才清理cookies
                res.clearCookie('id').clearCookie('token');
            }
            const referer = req.headers.referer || '/login';
            res.redirect(referer);
        }
    }catch (ex){
        next(ex);
    }

});

//api/pic
Request.get('/api/pic([0-9]+)', async(req, res, next) => {
    const pic = req.params[0];
    try {
        let realPath = await pictureApi.getPicPath(pic);
        if(realPath){
            res.setHeader('Cache-Control', 'public, max-age=1d');
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
        const title = `${site_name} | 博客`;

        //初始化页面数据 获取文章列表数据
        let articles = await articleApi.queryArticle();

        //最新评论5条
        let newComments = await commentApi.newCommentList();

        //今日格言
        let { text:motto } = await mottoApi.todayMotto();

        const state  = { articles: articles, newComments: newComments, motto: motto };

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

        //文章阅读次数+1
        await articleApi.articleViewAdd(ad);

        //初始化页面数据 获取文章数据
        let article = await articleApi.getArticle(ad);
        if(!article) return next();

        //最新评论5条
        let newComments = await commentApi.newCommentList();

        //今日格言
        let { text:motto } = await mottoApi.todayMotto();

        const state  = { article: article,  newComments: newComments, motto: motto };

        //网站标题是文章标题
        const title = `${site_name} | ${article.title}`;
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
        const title = `${site_name} | 主人登录~`;

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

Request.get('/login/jump-weibo',(req, res, next) => {

    const referer = req.headers.referer || '/blog';
    const website_url = Request.websiteConfig.site_url.value;
    const url = `https://api.weibo.com/oauth2/authorize?client_id=${wbApp.client_id}&response_type=code&redirect_uri=${website_url}/login/weibo?back_uri=${referer}`;
    res.redirect(url);
});

Request.get('/login/weibo', async(req, res, next) => {

    //获取网站配置
    const websiteConfig = Request.websiteConfig;
    const website_url = Request.websiteConfig.site_url.value;
    const site_name = websiteConfig.site_name.value;
    const title = `${site_name}`;

    const back_uri = req.query.back_uri ? req.query.back_uri : '/';
    const code = req.query.code || false;

    let state = {message: {text: '', url: back_uri}};

    try {

        if(!code){
            return res.redirect(back_uri);
        }


        let data = {
            client_id: wbApp.client_id,
            client_secret: wbApp.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: `${website_url}/login/weibo`
        };
        let ret;
        const NOW_TIME = parseInt(Date.now() / 1000);
        //获取access_token

        ret = await serverHttp.apiPost('https://api.weibo.com/oauth2/access_token', data);

        const access = {
            access_token: ret.access_token,
            uid: ret.uid,
            expires_time: NOW_TIME + ret.expires_in
        };

        //获取微博用户信息
        ret = await serverHttp.apiGet(`https://api.weibo.com/2/users/show.json?access_token=${access.access_token}&uid=${access.uid}`);
        const user_info = {
            weibo_uid: ret.id,
            nickname: ret.name,
            head: ret.avatar_large,
            sex: {m:1 ,f: 0, n: 2}[ret.gender],
            profile_url: ret.profile_url,
            weibo_access_token: access.access_token,

        };

        //获取本站用户信息
        ret = await userApi.getWbUserInfo(user_info.weibo_uid);
        if(ret.length == 0){
            //创建微博用户
            ret = await userApi.createWbUser(user_info);
            if(!ret){
                return res.send('登录失败，请重试');
            }
        }else{
            //更新微博用户信息
            await userApi.updateWbUser(user_info, true);
        }
        ret = await userApi.getWbUserInfo(user_info.weibo_uid);

        if(ret.length>0){
            let userInfo = ret[0];
            const cookiesOption = {
                maxAge: cookieConfig.maxAge //3天,
            };
            const login_token = await userApi.addLoginToken(userInfo.id);
            res.cookie('id',userInfo.id, cookiesOption).cookie('token', login_token, cookiesOption);
        }

        //成功
        state.message.text = '登录成功~';
    }catch (ex){
        state.message.text = '登录失败~';
    }

    resRender(req, res, title, state, 'index');

});

Request.get('/login/jump-zslm',async(req, res, next) => {

    const referer = req.headers.referer || '/blog';
    const website_url = Request.websiteConfig.site_url.value;
    const website_name = Request.websiteConfig.site_name.value;
    const md5 = Date.now();
    const redirect_uri = encodeURI(`${website_url}/login/zslm?back_uri=${referer}`);
    let oajson = await serverHttp.apiGet(`https://login.zslm.org/api/?type=OA2md5&redirect_uri=${redirect_uri}&md5=${md5}&name=${encodeURI(website_name)}`);
    if(oajson.errornum == 1){
        //为1则为OA预创建成功
        const OA2code = oajson.msg;
        const url = `https://login.zslm.org/api/?type=OA2&OA2code=${OA2code}`;
        res.redirect(url);
    }else{
        res.send('登录失败');
    }
});

Request.get('/login/zslm', async(req, res, next) => {

    //获取网站配置
    const websiteConfig = Request.websiteConfig;
    const site_name = websiteConfig.site_name.value;
    const title = `${site_name}`;

    const back_uri = req.query.back_uri ? req.query.back_uri : '/';
    const code = req.query.code || false;

    let state = {message: {text: '', url: back_uri}};

    try {

        if(!code){
            return res.redirect(back_uri);
        }


        let oajson = await serverHttp.apiGet(`https://login.zslm.org/api/?type=code&code=${code}`);

        if(oajson.errornum != 1){
            state.message.text = '登录失败~';
            resRender(req, res, title, state, 'index');
            return;
        }

        const user_info = {
            account: oajson.msg.name,
            nickname: oajson.msg.name,
            head: oajson.msg.userimg,
            sex: [0, 2, 1][oajson.msg.sex]
        };

        let ret;

        //获取本站用户信息
        ret = await userApi.getZsUserInfo(user_info.account);
        if(ret.length == 0){
            //创建用户
            ret = await userApi.createZsUser(user_info);
            if(!ret){
                return res.send('登录失败，请重试');
            }
        }else{
            //更新用户信息
            await userApi.updateZsUser(user_info, true);
        }
        ret = await userApi.getZsUserInfo(user_info.account);

        if(ret.length>0){
            let userInfo = ret[0];
            const cookiesOption = {
                maxAge: cookieConfig.maxAge //3天,
            };
            const login_token = await userApi.addLoginToken(userInfo.id);
            res.cookie('id',userInfo.id, cookiesOption).cookie('token', login_token, cookiesOption);
        }

        //成功
        state.message.text = '登录成功~';
    }catch (ex){
        state.message.text = '登录失败~';
    }

    resRender(req, res, title, state, 'index');

});

export default Request.router;