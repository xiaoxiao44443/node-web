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
import commentApi from '../../api/comment';
import mottoApi from '../../api/motto';
import musicApi from '../../api/music';
import friendApi from '../../api/friend';

//音乐盒信息
const getMusicInfo = async () => {
    const musicInfo = await musicApi.getMusicInfo();
    if(Request.USER.id && ([1,2].indexOf(Request.USER.group_id) > -1)) {
        //用于前台判断是否显示音乐盒的操作
        musicInfo._music.adminMode = true;
    }
    return musicInfo;
};

//博客导航信息
const getBlogNavInfo = async () => {
    //最新评论5条
    let newComments = await commentApi.newCommentList();

    //今日格言
    let { text:motto } = await mottoApi.todayMotto();

    //友情链接
    let friends = await friendApi.queryAllFriend();

    return { newComments, motto, friends };
};

//api/pic
Request.get('/api/pic([0-9]+)', async(req, res, next) => {
    try {
        const pic = req.params[0];
        let format = req.query.format;

        let realPath = await pictureApi.getPicPath(pic);
        if(realPath){
            res.setHeader('Cache-Control', 'public, max-age=1d');
            if (format) {
                //缩放图片
                //比如 300x300
                format = format.split('x');
                let w = null;
                let h = null;
                if (format.length == 1) {
                    w = (format[0] > 0 && format[0] < 9999) ? parseInt(format[0]) : w;
                }
                if (format.length == 2) {
                    w = (format[0] > 0 && format[0] < 9999) ? parseInt(format[0]) : w;
                    h = (format[1] > 0 && format[1] < 9999) ? parseInt(format[1]) : h;
                }
                if (w || h) {
                    let image;
                    let metadata = false;
                    try {
                        const sharp = require('sharp');
                        image = sharp(realPath);
                        metadata = await image.metadata();
                    } catch (err) {
                        //
                    }
                    if (metadata) {
                        const buffer = await image.resize(w, h).toBuffer();
                        res.setHeader('Content-Type', `image/${metadata.format}`);
                        res.send(buffer);
                    } else {
                        res.sendFile(realPath);
                    }
                }
            } else {
                res.sendFile(realPath);
            }

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

        //音乐盒信息
        const musicInfo = await getMusicInfo();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title, false, musicInfo));
        }else{
            resRender(req, res, title, state, 'index', musicInfo);
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

        //博客导航信息
        let blogNavInfo = await getBlogNavInfo();

        const state  = { articles: articles, ...blogNavInfo };

        //音乐盒信息
        const musicInfo = await getMusicInfo();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title, false, musicInfo));
        }else{
            resRender(req, res, title, state, 'index', musicInfo);
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

        //博客导航信息
        let blogNavInfo = await getBlogNavInfo();

        const state  = { article: article,  ...blogNavInfo };

        //网站标题是文章标题
        const title = `${site_name} | ${article.title}`;

        //音乐盒信息
        const musicInfo = await getMusicInfo();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title, false, musicInfo));
        }else{
            resRender(req, res, title, state, 'index', musicInfo);
        }

    }catch (ex){
        next(ex);
    }
});

//message-board
Request.get('/message-board', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}`;

        //初始化页面数据

        //博客导航信息
        let blogNavInfo = await getBlogNavInfo();

        const state = { ...blogNavInfo };

        //音乐盒信息
        const musicInfo = await getMusicInfo();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title, false, musicInfo));
        }else{
            resRender(req, res, title, state, 'index', musicInfo);
        }

    }catch (ex){
        next(ex);
    }
});

//message-board
Request.get('/about', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}`;

        //初始化页面数据

        //博客导航信息
        let blogNavInfo = await getBlogNavInfo();

        const state = { ...blogNavInfo };

        //音乐盒信息
        const musicInfo = await getMusicInfo();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title, false, musicInfo));
        }else{
            resRender(req, res, title, state, 'index', musicInfo);
        }

    }catch (ex){
        next(ex);
    }
});


export default Request.router;