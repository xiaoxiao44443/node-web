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
import configApi from "../../../api/config";

const stateFilter = AdminStateFilter(Request);

//admin/site-config
Request.get('/site-config', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据
        const _websiteConfig = {
            site_name: websiteConfig.site_name.value,
            site_url: websiteConfig.site_url.value,
            author: websiteConfig.author.value,
            application_name: websiteConfig.application_name.value,
            description: websiteConfig.description.value,
            keywords: websiteConfig.keywords.value
        };
        const state = stateFilter({ websiteConfig: _websiteConfig });

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

            if (Request.USER.group_id != 1) return res.json(returnErr('你所在的用户组无权进行此操作'));

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

export default Request.router;