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
import userApi from "../../../api/user";

const stateFilter = AdminStateFilter(Request);

//admin/account
Request.get('/account', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据
        const account = {
            nickname:Request.USER.nickname,
            head: Request.USER.head,
            sex: Request.USER.sex,
            email: Request.USER.email
        };
        const state = stateFilter({ account: account });

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//admin/account
Request.post('/account', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const account = req.body.account;

            //更新用户信息
            try {
                await userApi.updateUser(Request.USER.id, account);
                res.json(returnSuc('保存成功~'));
            } catch (err) {
                res.json(returnErr(err.message));
            }
        }

    }catch (ex){
        next(ex);
    }
});

export default Request.router;