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
import mottoApi from "../../../api/motto";

const stateFilter = AdminStateFilter(Request);

//admin/recommend
Request.get('/recommend', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据
        let ret = await mottoApi.todayMotto();
        const recommend = {
            motto: ret.text
        };
        const state = stateFilter({ recommend: recommend });

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//admin/recommend
Request.post('/recommend', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const recommend = req.body.recommend;

            let motto = recommend.motto;

            //更新今日格言
            let ret = await mottoApi.editTodayMotto(motto);

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