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

import musicApi from "../../../api/music";
import configApi from "../../../api/config";
import serverHttp from "../../../tool/server-http";

const stateFilter = AdminStateFilter(Request);

//admin/music/list
Request.get('/music/list', async(req, res, next) => {
    try {
        //获取网站配置
        const websiteConfig = Request.websiteConfig;
        const site_name = websiteConfig.site_name.value;
        const title = `${site_name} | 后台管理`;

        //初始化页面数据 获取所有音乐列表
        let musics = await musicApi.queryMusicList();

        //获取音乐配置
        const musicConfig = await configApi.music();
        const defaultMusic = musicConfig.default_music.value;

        musics = musics.map(val => {
            val.isDefault = val.id == defaultMusic;
            return val;
        });

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

//修改音乐播放模式
Request.post('/music/mode', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const mode = parseInt(req.body.mode);
            if([0,1,2].indexOf(mode) == -1) return res.json(returnErr('音乐模式错误'));

            //更新音乐配置
            let musicConfig = await configApi.music();
            musicConfig.mode.value = mode;
            let ret = await configApi.updateMusic(musicConfig);

            if(ret){
                res.json(returnSuc('修改播放模式成功~'));
            }else{
                res.json(returnErr('修改播放模式失败!'));
            }
        }

    }catch (ex){
        next(ex);
    }
});

//设置默认音乐
Request.post('/music/default', async(req, res, next) => {
    try {

        if(Request.REQUEST_JSON){

            const id = parseInt(req.body.id);
            if(id <= 0) return res.json(returnErr('音乐id错误'));

            //设置默认音乐
            const ret = await musicApi.setDefaultMusic(id);

            if(ret){
                res.json(returnSuc('设置成功~'));
            }else{
                res.json(returnErr('设置失败!'));
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

        //初始化页面数据 获取音乐数据
        let music = await musicApi.getMusic(id);

        if(!music) return next();

        //获取音乐配置
        const musicConfig = await configApi.music();
        const defaultMusic = musicConfig.default_music.value;

        const state  = stateFilter({ music: music, isDefault:music.id == defaultMusic });

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
            const isDefault = req.body.isDefault;

            if(id>0){
                //保存音乐
                let ret = await musicApi.editMusic(id, music);

                if (isDefault) {
                    //设置默认音乐
                    await musicApi.setDefaultMusic(id);
                } else {
                    //取消设置默认音乐
                    await musicApi.unSetDefaultMusic(id);
                }
                res.json(returnSuc(ret));
            }else{
                //添加音乐
                const newMusicId = await musicApi.addMusic(music);

                if (isDefault) {
                    //设置默认音乐
                    await musicApi.setDefaultMusic(newMusicId);
                }
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
        //移除http
        const removeHttp = (url) => {
            if (!url) return '';
            return url.substring(0,7)== 'http://' ? url.substring(5) : url;
        };

        let music = ret.data[0];
        music = {
            cover: removeHttp(music.pic.slice(0, music.pic.indexOf('?'))),
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
            defaultMusic: musicConfig.default_music.value
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
                default_music: { name: musicConfig.default_music.name, value: parseInt(newMusicConfig.defaultMusic) }
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


export default Request.router;