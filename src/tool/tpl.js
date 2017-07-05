/**
 * Created by xiao on 2017/2/26.
 */
import fs from 'fs';
import path from 'path';
import { minify } from 'html-minifier';
const minifyOptions = {
    collapseWhitespace: true,
    decodeEntities: true,
    html5: true,
    trimCustomFragments: true
};
const tpl = (filePath, options, callback) => {
    fs.readFile(filePath, (err, content) => {
        if(err) return callback(new Error(err));
        //html压缩
        options = options || {};
        let rendered = content.toString();
        rendered = minify(rendered, minifyOptions);
        const ignore = ['settings', '_locals', 'cache'];
        rendered = rendered.replace(/#([\S]*?)#/g, ($0, $1) =>{
            return $1 in options ? options[$1] : '';
        });
        return callback(null, rendered);
    });
};

export default (app) => {
    app.engine('html', tpl);
    app.set('views', path.resolve(__dirname,'../view'));
    app.set('view engine', 'html');
    app.set('view cache', true);
}