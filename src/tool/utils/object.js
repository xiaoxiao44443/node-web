/**
 * Created by xiao on 2017/5/11.
 */
const getKeyInObject = (object,exp) => {
    if(typeof object == 'undefined') return undefined;
    let args = exp.split('.');
    let o = object;
    for(let val of args){
        if(!o.hasOwnProperty(val)) return undefined;
        o = o[val];
    }
    return o;
};

exports.getKeyInObject = getKeyInObject;