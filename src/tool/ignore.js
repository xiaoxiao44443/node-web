/**
 * Created by xiao on 2017/5/6.
 */

const ignore = () => {
    const extensions = ['.css', '.less']; //里面定义不需要加载的文件类型

    extensions.forEach((val) => {
        require.extensions[val] = () => false;
    });

};

export default ignore();