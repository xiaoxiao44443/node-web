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
import uploader from "../../../tool/uploader";
import pictureApi from "../../../api/picture";

const stateFilter = AdminStateFilter(Request);

//根据类型上传图片
Request.post('/edit/upload-img', async(req, res, next) => {

    try{
        (new uploader.imageUpload)(req, res, async err => {
            if(err){
                res.send(returnErr(err.message));
            }else{
                const files = req.files;
                const type = parseInt(req.body.type);

                if(files){
                    //图片压缩，超过300k的友联图片压缩到300x300
                    const filesPath = await pictureApi.compress(files, type);

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
            if (pictureApi.checkPicType(type) === false) {
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

Request.post('/edit/delete-pic', async(req, res, next) => {

    try {
        //获取网站配置
        if(Request.REQUEST_JSON){
            //初始化数据
            const id = req.body.id;

            let ret = await pictureApi.deletePic(id);
            if(ret){
                res.json(returnSuc('删除成功~'));
            }else{
                res.json(returnErr('删除失败!'));
            }
        }
    }catch (ex) {
        next(ex);
    }
});

export default Request.router;