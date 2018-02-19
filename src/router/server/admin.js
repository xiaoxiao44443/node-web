/**
 * Created by xiao on 2017/5/13.
 */
import RequestModel, {
    returnSuc,
    returnErr,
    resRender
} from '../../tool/Request';

const Request = new RequestModel;
import { AdminStateFilter } from '../../tool/stateFilters';
import articleRouter from './admin/article';
import accountRouter from './admin/account';
import editPictureRouter from './admin/editPicture';
import friendRouter from './admin/friend';
import musicRouter from './admin/music';
import recommendRouter from './admin/recommend';
import siteConfigRouter from './admin/siteConfig';

const stateFilter = AdminStateFilter(Request);

//验证登录
Request.use(async(req, res, next) => {

    try {
        if(req.method == 'GET'){
            if(!Request.USER.id || Request.USER.group_id !== 1) return res.redirect('/login');
        }else if(req.method == 'POST'){
            if(!Request.USER.id || Request.USER.group_id !== 1) return res.json(returnErr('请先登录~', '请先登录~', '/login'));
        }
        next();
    }catch (ex){
        next(ex);
    }
});

//admin/article 相关路由
Request.router.use(articleRouter);

//admin/site-config 相关路由
Request.router.use(siteConfigRouter);

//admin/edit 相关路由
Request.router.use(editPictureRouter);

//admin/recommend 相关路由
Request.router.use(recommendRouter);

//admin/account 相关路由
Request.router.use(accountRouter);

//admin/music 相关路由
Request.router.use(musicRouter);

//admin/friend 相关路由
Request.router.use(friendRouter);

//admin
Request.use(async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据
        const state = stateFilter();

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