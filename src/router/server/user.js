/**
 * Created by xiao on 2017/5/20.
 */
import RequestModel, {
    returnSuc,
    returnErr,
    resRender,
} from '../../tool/Request';
const Request = new RequestModel;
import userApi from '../../api/user';

Request.get('/check-login', (req, res, next) => {

    if(Request.REQUEST_JSON){
        let ret = false;
        if(Request.USER.id){
            ret = {
                nickname: Request.USER.nickname,
                head: Request.USER.head,
                profile_url: Request.USER.profile_url,
                email: Request.USER.email
            };
        }
        res.json(returnSuc(ret));
    }
});

Request.post('/update-email', async (req, res, next) => {
    if(Request.REQUEST_JSON){
        let email = req.body.email;
        if (Request.USER.id) {
            if (Request.USER.email == email) {
                return res.json(returnSuc('不需要更新邮箱'));
            }
            const user_id = Request.USER.id;
            const ret = userApi.updateUser(user_id, { email });
            if (ret) {
                res.json(returnSuc('更新邮箱成功'));
            } else {
                res.json(returnErr('更新邮箱失败'));
            }
        } else {
            if(!Request.USER.id) return res.json(returnErr('请先登录~', '请先登录~'));
        }
    }
});

export default Request.router;