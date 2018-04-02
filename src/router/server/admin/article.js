/**
 * Created by xiao on 2018/2/20.
 */
import  RequestModel, {
    returnSuc,
    returnErr,
    resRender
} from '../../../tool/Request';
const Request = new RequestModel;
import { AdminStateFilter } from '../../../tool/stateFilters';
import articleApi from "../../../api/article";

const stateFilter = AdminStateFilter(Request);

Request.get('/article/list', async(req, res, next) =>{
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取50条文章列表
        let articles = await articleApi.queryArticleAdmin();

        let state = stateFilter({articles: articles});

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
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取文章数据
        let article = await articleApi.getArticle(ad);
        const state  = stateFilter({ article: article });

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

            if (Request.USER.group_id != 1) return res.json(returnErr('你所在的用户组无权进行此操作'));

            if(ad>0){
                //保存文章
                let ret = await articleApi.saveArticle(ad, article);
                res.json(returnSuc(ret));
            }else{
                //发布文章
                article.author = Request.USER.id;
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

            if (Request.USER.group_id != 1) return res.json(returnErr('你所在的用户组无权进行此操作'));

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
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取文章数据
        let article = {
            title: '',
            text: '',
            summary: ''
        };
        const state  = stateFilter({ article: article });

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

export default Request.router;