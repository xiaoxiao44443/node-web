/**
 * Created by xiao on 2017/5/13.
 */
import RequestModel, {
    returnSuc,
    returnErr,
    resRender
} from '../../tool/Request';

import articleApi from '../../api/article';
import configApi from '../../api/config';
const Request = new RequestModel;
import uploader from '../../tool/uploader';
import pictureApi from '../../api/picture';
import mottoApi from '../../api/motto';
import userApi from '../../api/user';
import musicApi from '../../api/music';
import friendApi from '../../api/friend';
import serverHttp from "../../tool/server-http";

//state添加用户信息
const addUserInfo = state => {
    state.user = { nickname: Request.USER.nickname };
};

//state信息过滤
const stateFilter = (state = {}) => {
    addUserInfo(state);
    return state;
};

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

//根据类型上传图片
Request.post('/edit/upload-img', async(req, res, next) => {

    try{
        (new uploader.imageUpload)(req, res, async err => {
            if(err){
                next(err);
            }else{
                const files = req.files;
                const type =parseInt(req.body.type);

                if(files){
                    const filesPath = files.map(val => {
                        return val.path;
                    });
                    try {
                        const ret = await pictureApi.savePic(filesPath, type, Request.USER.id);
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

//根据类型获取已上传的图片列表 50张
Request.post('/edit/uploaded-pics', async(req, res, next) => {

    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            //初始化数据
            const type = parseInt(req.body.type);
            if ([1, 2].indexOf(type) == -1) {
                res.json(returnErr('图片类型错误'));
                return;
            }
            const p = req.body.p;

            let pics = await pictureApi.getPicsByType(type, Request.USER.id,{p});
            res.json(returnSuc(pics));
        }
    }catch (ex){
        next(ex);
    }
});

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

//admin/music/list
Request.get('/music/list', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取所有音乐列表
        let musics = await musicApi.queryMusicList();

        let state = stateFilter({musics: musics});

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//删除音乐
Request.post('/music/delete', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            const id = req.body.id;
            if(id <= 0) return res.json(returnErr('音乐id错误'));

            let ret = await musicApi.deleteMusic(id);
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

//音乐编辑页面 /admin/music/edit
Request.get('/music/edit/id([0-9]+)', async(req, res, next) =>{
    try {
        const id = req.params[0];

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取文章数据
        let music = await musicApi.getMusic(id);
        const state  = stateFilter({ music: music });

        if(!music) return next();


        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//添加/保存音乐
Request.post('/music/edit', async(req, res, next) =>{
    try {

        if(Request.REQUEST_JSON){

            const id = req.body.id;
            const music = req.body.music;

            if(id>0){
                //保存文章
                let ret = await musicApi.editMusic(id, music);
                res.json(returnSuc(ret));
            }else{
                //发布文章
                await musicApi.addMusic(music);
                res.json(returnSuc('添加成功!'));
            }

        }

    }catch (ex){
        next(ex);
    }
});


//添加音乐页面
Request.get('/music/add', async(req, res, next) =>{
    try {

        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取文章数据
        let music = {
            caption: '',
            cover: '',
            author: '',
            src: ''
        };
        const state  = stateFilter({ music: music });

        if(!music) return next();

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }

});

//网易云音乐解析admin
Request.post('/net-music', async(req, res, next) => {

    let data = {
        music_input: '',
        music_filter: 'id',
        music_type: 'netease'
    };
    const header = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
    const net_music_id = req.body.net_music_id;
    data.music_input = net_music_id;
    const ret = await serverHttp.apiPost2('http://www.guqiankun.com/tools/music/?source=toolsindex', data, header);
    //移除http
    if (ret.code == 200) {
        let music = ret.data[0];
        if (!music.url) return '';
        music.url = music.url.substring(0,7)== 'http://' ? music.url.substring(5) : url;
        music = {
            cover: music.pic.slice(0, music.pic.indexOf('?')),
            caption: music.title,
            src: '/music/id' + net_music_id,
            author: music.author
        };
        res.json(returnSuc(music));
    } else {
        res.json(returnErr('解析失败!'));
    }
});

//admin/music/config
Request.get('/music/config', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据
        const musicConfig = await configApi.music();
        const _musicConfig = {
            mode: musicConfig.mode.value,
            audioIndex: musicConfig.audio_index.value
        };
        const state = stateFilter({ musicConfig: _musicConfig });

        if(Request.REQUEST_JSON){
            res.json(returnSuc(state, title));
        }else{
            resRender(req, res, title, state, 'admin');
        }

    }catch (ex){
        next(ex);
    }
});

//音乐设置 admin/music/config
Request.post('/music/config', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const musicConfig = await configApi.music();
            const newMusicConfig = req.body.musicConfig;

            let _musicConfig = {
                mode: { name: musicConfig.mode.name, value: parseInt(newMusicConfig.mode) },
                audio_index: { name: musicConfig.audio_index.name, value: parseInt(newMusicConfig.audioIndex) }
            };

            //更新音乐配置
            let ret = await configApi.updateMusic(_musicConfig);

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

//admin/music 都默认调到music/list
Request.get('/music*', async(req, res, next) => {
    res.redirect('/admin/music/list');
});

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

//admin/friend 都默认调到friend/list
Request.get('/friend*', async(req, res, next) => {
    res.redirect('/admin/friend/list');
});

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