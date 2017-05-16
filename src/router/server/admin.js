/**
 * Created by xiao on 2017/5/13.
 */
import serverRender from '../../tool/server-render';
import Model from '../../tool/Model';
import RequestModel, {
    returnSuc,
    returnErr,
    resRender
} from '../../tool/Request';

import articleApi from '../../api/article';
import configApi from '../../api/config';
const Request = new RequestModel;
import userApi from '../../api/user';
import uploader from '../../tool/uploader';
import pictureApi from '../../api/picture';

//验证登录
Request.use(async(req, res, next) => {

    try {
        const id = req.cookies.id || 0;
        const token = req.cookies.token || '';
        const ret = await userApi.tokenLogin(id, token);

        if(req.method == 'GET'){
            if(!ret) return res.redirect('/login');
        }else if(req.method == 'POST'){
            if(!ret) return res.json(returnErr('请先登录~', '请先登录~', '/login'));
        }
        Request.USER.id = id;
        next();
    }catch (ex){
        next(ex);
    }
});

Request.get('/article/list', async(req, res, next) =>{
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|后台管理`;

        //初始化页面数据 获取50条文章列表
        let articles = await articleApi.queryArticleAdmin();

        const state = {articles: articles};

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//get more article
Request.post('/article/list', async(req, res, next) =>{
    try {
        //获取网站配置

        if(Request.REQUEST_JSON){
            //初始化数据 获取50条文章列表
            const p = req.body.p;

            let articles = await articleApi.queryArticleAdmin({p});
            res.json(returnSuc(articles));
        }

    }catch (ex){
        next(ex);
    }
});

// article/edit
Request.get('/article/edit/ad([0-9]+)', async(req, res, next) =>{
    try {
        const ad = req.params[0];

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|后台管理`;

        //初始化页面数据 获取文章数据
        let article = await articleApi.getArticle(ad);
        const state  = { article: article };
        if(!article) return next();


        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//发布/保存文章
Request.post('/article/edit', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            const ad = req.body.ad;
            const article = req.body.article;

            if(ad>0){
                //保存文章
                let ret = await articleApi.saveArticle(ad, article);
                res.json(returnSuc(ret));
            }else{
                //发布文章
                //TODO 获取作者id
                article.author = 1;
                await articleApi.publishArticle(article);
                res.json(returnSuc('发布成功!'));
            }

        }

    }catch (ex){
        next(ex);
    }
});

//删除文章
Request.post('/article/delete', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            const ad = req.body.ad;
            if(ad <= 0) return res.json(returnErr('文章id错误'));

            let ret = await articleApi.deleteArticle(ad);
            if(ret){
                res.json(returnSuc('删除成功~'));
            }else{
                res.json(returnErr('删除失败!'));
            }

        }

    }catch (ex){
        next(ex);
    }
});

//发布文章页面
Request.get('/article/write', async(req, res, next) =>{
    try {

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|后台管理`;

        //初始化页面数据 获取文章数据
        let article = {
            title: '',
            text: '',
            summary: ''
        };
        const state  = { article: article };
        if(!article) return next();


        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }

});


//admin/article 都默认调到article/list
Request.get('/article*', async(req, res, next) => {
    res.redirect('/admin/article/list');
});

//admin/site-config
Request.get('/site-config', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|后台管理`;

        //初始化页面数据
        const _websiteConfig = {
            site_name: websiteConfig.site_name.value,
            site_url: websiteConfig.site_url.value,
            author: websiteConfig.author.value,
            application_name: websiteConfig.application_name.value,
            description: websiteConfig.description.value,
            keywords: websiteConfig.keywords.value
        };
        const state = { websiteConfig: _websiteConfig };

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//admin/site-config
Request.post('/site-config', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const newWebsiteConfig = req.body.websiteConfig;

            let _websiteConfig = {};

            for(let p in newWebsiteConfig){
                _websiteConfig[p] = {
                    name: Request.websiteConfig[p].name,
                    value: newWebsiteConfig[p]
                };
            }

            //更新网站配置
            let ret = await configApi.updateWebsite(_websiteConfig);

            if(ret){
                res.json(returnSuc('保存成功~'));
            }else{
                res.json(returnErr('保存失败!'));
            }
        }

    }catch (ex){
        next(ex);
    }
});

Request.post('/article/edit/upload-img', async(req, res, next) => {

    try{
        (new uploader.blogImgUpload)(req, res, async err => {
            if(err){
                next(err);
            }else{
                const files = req.files;

                if(files){
                    const filesPath = files.map(val => {
                        return val.path;
                    });
                    try {
                        const ret = await pictureApi.savePic(filesPath, 1, Request.USER.id);
                        if(ret){
                            res.json(returnSuc('上传成功'));
                        }else{
                            res.json(returnErr('上传失败'));
                        }
                    }catch (ex){
                        return next(ex);
                    }
                }else{
                    res.json(returnErr('上传失败'));
                }
            }
        });
    }catch (ex){
        next(ex);
    }
});

//获取已上传的文章图片列表 50张
Request.post('/article/edit/uploaded-pics', async(req, res, next) => {

    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            //初始化数据
            const p = req.body.p;

            let pics = await pictureApi.getPicsByType(1, Request.USER.id,{p});
            res.json(returnSuc(pics));
        }
    }catch (ex){
        next(ex);
    }
});

//admin
Request.use(async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name}|后台管理`;

        //初始化页面数据
        const state = {};

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }

});

export default Request.router;