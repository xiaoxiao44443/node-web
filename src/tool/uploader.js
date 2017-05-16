/**
 * Created by xiao on 2017/5/16.
 */
import multer from 'multer';
import moment from 'moment';


const fileFilter = (req, file, cb) => {
    //上传过滤 暂不做
    cb(null, true)
};

const blogImgUpload = function (cb) {
    const destination = './public/upload/images/article/' + moment().format('YYYY/MM/DD');
    return multer({
        storage: multer.diskStorage({
            destination: destination,
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
    blogImgUpload
}