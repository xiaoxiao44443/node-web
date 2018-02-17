/**
 * Created by xiao on 2017/5/17.
 */
import Model from '../../tool/Model';
import RequestModel, {
    returnSuc,
    returnErr
} from '../../tool/Request';
import articleApi from '../../api/article';
const Request = new RequestModel;
import commentApi from '../../api/comment';

/**
 * 评论指评论文章 回复指回复评论
 */

//分页查询评论 + 3条回复
Request.post('/query', async(req, res, next) => {

    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            //初始化数据 获取50条文章列表
            const { p, type } = req.body;
            const type_key = typeof req.body.type_key === 'undefined' ? false : req.body.type_key;

            let comments = await commentApi.query(type, type_key ,{p});
            comments.total_count = comments.count;

            for(let i=0; i<comments.list.length; i++){
                try {
                    comments.list[i].replies = await commentApi.queryReply(comments.list[i].id, {size: 3});
                    comments.total_count += comments.list[i].replies.count;
                }catch (ex){
                    return next(ex);
                }
            }

            res.json(returnSuc(comments));
        }

    }catch (ex){
        next(ex);
    }
});

//分页查询回复
Request.post('/query-reply', async(req, res, next) => {
    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            const { p, id } = req.body;
            let reply = await commentApi.queryReply( id ,{p, size:5});
            res.json(returnSuc(reply));
        }
    }catch (ex){
        next(ex);
    }
});

//根据回复查找到指定评论页码
Request.post('/find-comment', async(req, res, next) => {
    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            const { id } = req.body;
            let ret = await commentApi.queryByComment(id);
            if (ret) {
                res.json(returnSuc(ret));
            } else {
                res.json(returnErr('该评论不存在'));
            }
        }
    }catch (ex){
        next(ex);
    }
});

//发表评论
Request.post('/send', async(req, res, next) => {
    //需要登录
    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            if(Request.USER.id){
                const { type, type_key, content } = req.body;
                const uid = Request.USER.id;
                let ret;
                //发表限制判断
                ret = await commentApi.sendLimit(uid);
                if(ret !== true) return res.json(returnErr(ret));

                //发表回复
                ret = await commentApi.send(type, type_key, uid,content);
                if(ret){

                    //文章评论数+1
                    if(type == 'article' && type_key){
                        await articleApi.articleCommentsAdd(type_key);
                    }

                    return res.json(returnSuc('发表成功~'));
                }else{
                    return res.json(returnErr('发表失败,不知道为什么~'));
                }
            }else{
                if(!Request.USER.id) return res.json(returnErr('请先登录~', '请先登录~'));
            }
        }
    }catch (ex){
        next(ex);
    }
});

//回复评论
Request.post('/reply', async(req, res, next) => {
    //需要登录
    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            if(Request.USER.id){
                const { comment_id, reply_id, content } = req.body;
                const uid = Request.USER.id;
                let ret;
                //发表限制判断
                ret = await commentApi.sendLimit(uid);
                if(ret !== true) return res.json(returnErr(ret));

                //发表回复
                ret = await commentApi.reply(comment_id, reply_id, uid,content);
                if(ret){
                    return res.json(returnSuc('发表成功~'));
                }else{
                    return res.json(returnErr('发表失败,不知道为什么~'));
                }
            }else{
                if(!Request.USER.id) return res.json(returnErr('请先登录~', '请先登录~'));
            }
        }
    }catch (ex){
        next(ex);
    }
});

//删除评论或回复
Request.post('/delete', async(req, res, next) => {

});

export default Request.router;