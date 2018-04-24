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
import friendApi from "../../../api/friend";

const stateFilter = AdminStateFilter(Request);

Request.get('/friend/list', async(req, res, next) =>{
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取20个友联
        let friends = await friendApi.queryFriendAdmin();

        let state = stateFilter({friends: friends});

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
Request.post('/friend/list', async(req, res, next) =>{
    try {
        //获取网站配置

        if(Request.REQUEST_JSON){
            //初始化页面数据 获取20个友联
            const p = req.body.p;

            let friends = await friendApi.queryFriendAdmin({p});
            res.json(returnSuc(friends));
        }

    }catch (ex){
        next(ex);
    }
});

// article/edit
Request.get('/friend/edit/ad([0-9]+)', async(req, res, next) =>{
    try {
        const ad = req.params[0];

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取友联数据
        let friend = await friendApi.getFriend(ad);
        const state  = stateFilter({ friend: friend });

        if(!friend) return next();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//添加/编辑友联
Request.post('/friend/edit', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            if (Request.USER.group_id != 1) return res.json(returnErr('你所在的用户组无权进行此操作'));

            const ad = req.body.ad;
            const friend = req.body.friend;

            if(ad>0){
                //保存友联
                let ret = await friendApi.editFriend(ad, friend);
                res.json(returnSuc(ret));
            }else{
                //添加友联
                await friendApi.addFriend(friend);
                res.json(returnSuc('添加成功!'));
            }

        }

    }catch (ex){
        next(ex);
    }
});

//删除友联
Request.post('/friend/delete', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            if (Request.USER.group_id != 1) return res.json(returnErr('你所在的用户组无权进行此操作'));

            const ad = req.body.ad;
            if(ad <= 0 || !ad) return res.json(returnErr('友人id错误'));

            let ret = await friendApi.deleteFriend(ad);
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

//添加友联
Request.get('/friend/add', async(req, res, next) =>{
    try {
        const ad = req.params[0];

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取友联数据
        let friend = {
            friend_name: '',
            blog_name: '',
            blog_url: '',
            blog_motto: '',
            friend_head: '',
            display_order: 0
        };
        const state  = stateFilter({ friend: friend });

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//admin/friend 都默认调到friend/list
Request.get('/friend*', async(req, res, next) => {
    res.redirect('/admin/friend/list');
});

export default Request.router;