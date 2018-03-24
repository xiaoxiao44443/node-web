/**
 * Created by xiao on 2017/5/16.
 */
import multer from 'multer';
import moment from 'moment';
import mkdirp from 'mkdirp';
import pictureApi from '../api/picture';

const fileFilter = (req, file, cb) => {
    const type = parseInt(req.body.type);
    if (pictureApi.checkPicType(type) === false) {
        cb(new Error('错误的图片上传类型'));
    } else {
        cb(null, true)
    }
};

const destination = (req, file, cb) => {
    const type =  parseInt(req.body.type);
    let destination;
    if (type == pictureApi.picType.blog) {
        destination = './public/upload/images/article/' + moment().format('YYYY/MM/DD');
    }
    if (type == pictureApi.picType.friend) {
        destination = './public/upload/images/friend/' + moment().format('YYYY/MM/DD');
    }
    if (type == pictureApi.picType.music) {
        destination = './public/upload/images/music/' + moment().format('YYYY/MM/DD');
    }
    mkdirp(destination, err => {
        if (err) {
            cb(err);
        } else {
            cb(null, destination);
        }
    });
};

const imageUpload = function (cb) {
    return multer({
        storage: multer.diskStorage({
            destination,
            filename: function (req, file, cb) {
                cb(null, moment().format('YYYYMMDDHHssSSS') + `.${file['originalname'].match(/\.(\w+)$/)[1]}`)
            }
        }),
        fileFilter,
        limits: {
            fieldSize: '1MB',
            files: 10
        }
    }).array('images');
};

export default {
    imageUpload
}