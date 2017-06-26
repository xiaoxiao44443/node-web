/**
 * Created by xiao on 2017/5/20.
 */
import RequestModel, {
    returnSuc,
    returnErr,
    resRender,
} from '../../tool/Request';
const Request = new RequestModel;

Request.get('/check-login', (req, res, next) => {

    if(Request.REQUEST_JSON){
        let ret = false;
        if(Request.USER.id){
            ret = {
                nickname: Request.USER.nickname,
                head: Request.USER.head,
                profile_url: Request.USER.profile_url
            };
        }
        res.json(returnSuc(ret));
    }
});

export default Request.router;