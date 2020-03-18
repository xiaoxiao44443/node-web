/**
 * Created by xiao on 2018/2/20.
 */
import RequestModel, {
    returnSuc,
    returnErr,
    resRender,
} from '../../tool/Request';
const Request = new RequestModel;
import musicApi from "../../api/music";
import serverHttp from "../../tool/server-http";

//网易云音乐解析
Request.get('/id([0-9]+)', async(req, res, next) => {
    const music_id = req.params[0];

    const normalUrl = music_id => 'http://music.163.com/song/media/outer/url?id=' + music_id + '.mp3';

    let url = normalUrl(music_id);
    res.redirect(url);
});

//网易云音乐解析（旧）
/*Request.get('/id([0-9]+)', async(req, res, next) => {
    let data = {
        input: '',
        filter: 'id',
        type: 'netease',
        page: 1
    };
    const header = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
    const music_id = req.params[0];
    data.input = music_id;

    const ret = await serverHttp.apiPost2('http://www.guqiankun.com/tools/music/?source=toolsindex', data, header);
    console.log(ret)
    //移除http
    if (ret.code == 200) {
        let url = ret.data[0].url;
        if (!url) {
            //未解析到音乐地址，使用3号方案 http://music.163.com/song/media/outer/url?id=.mp3
            url = 'http://music.163.com/song/media/outer/url?id=' + music_id + '.mp3';
            //未解析到音乐地址，使用2号解析 http://i.oppsu.cn/link/  已经403了
            // url = 'http://i.oppsu.cn/link/' + music_id + '.mp3';
        } else {
            url = url.substring(0,7)== 'http://' ? url.substring(5) : url;
        }
        res.redirect(url);
    }
    if (ret.code == 404) {
        //未解析到音乐地址，使用3号方案 http://music.163.com/song/media/outer/url?id=.mp3
        let url = 'http://music.163.com/song/media/outer/url?id=' + music_id + '.mp3';
        console.log(url)
        res.redirect(url);
    }
});*/

//音乐列表
Request.get('/list',async(req, res, next) => {
    try {
        if(Request.REQUEST_JSON){
            //只允许ajax-get
            const ret = await musicApi.getMusicInfo();
            res.json(returnSuc(ret._music));
        }
    }catch (ex){
        next(ex);
    }
});

export default Request.router;