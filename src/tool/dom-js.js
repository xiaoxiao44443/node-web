/**
 * Created by xiao on 2017/6/4.
 */
import { maxWidthPoint } from '../enum';

const scroll2Element = ($ele, offset, duration) => {
    if(!$ele) return;
    let top = $ele.offsetTop;
    let current = $ele.offsetParent;
    while (current != null){
        top += current.offsetTop;
        current = current.offsetParent;
    }

    top += offset;

    const Easing = require('../component/common/tool/ease-sential');

    //手机端才需要减去导航高度
    const headerHeight = document.getElementById('header').offsetHeight;
    top = window.document.body.offsetWidth <= maxWidthPoint.small ? top - headerHeight : top;

    Easing.tween({
        from: getWindowScrollY(),
        to: top,
        ease: Easing.easeOutCubic,
        duration: duration,
        onProgress: (y) => {
            window.scrollTo(0, y)
        },
    });
};

const getWindowScrollY = () => {
    let y;
    if(window.pageYOffset){    // all except IE
        y = window.pageYOffset;
    }
    else if(window.document.documentElement && window.document.documentElement.scrollTop){    // IE 6 Strict
        y = window.document.documentElement.scrollTop;
    } else if(document.body){    // all other IE
        y = window.document.body.scrollTop;
    }
    return y;
};

const scroll2ElementByClassName = (className, offset = 0, timeout = 0, duration = 450) => {
    let $ele = document.getElementsByClassName(className)[0];
    if(timeout > 0){
        //延迟，等元素加载完毕
        const interval = (start_time) => {
            if(Date.now() > start_time + timeout) return;
            let $ele = document.getElementsByClassName(className)[0];
            if(!$ele){
                setTimeout(interval, 10, start_time)
            }else{
                scroll2Element($ele, offset, duration);
            }
        };
        interval(Date.now());
    }else{
        scroll2Element($ele, offset, duration);
    }
};

const scroll2EleByHashID = (hashID, offset = 0, timeout = 0, duration = 450) => {
    let id = hashID.replace(/^#/, '');
    let $ele = document.getElementById(id);
    if(timeout > 0){
        //延迟，等元素加载完毕
        const interval = (start_time) => {
            if(Date.now() > start_time + timeout) return;
            let $ele = document.getElementById(id);
            if(!$ele){
                setTimeout(interval, 10, start_time)
            }else{
                scroll2Element($ele, offset, duration);
            }
        };
        interval(Date.now());
    }else{
        scroll2Element($ele, offset, duration);
    }

};

export {
    scroll2ElementByClassName,
    scroll2EleByHashID,
    getWindowScrollY
}