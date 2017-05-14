/**
 * Created by xiao on 2017/5/14.
 */
import crypto from './utils/crypto';

const createUserToken = () => {
    let rnd = Math.random(Date.now()).toString();
    return crypto.md5(crypto.sha1(rnd));
};

const userPassword = psw => {
    return crypto.md5(crypto.sha1(psw));
};

export {
    createUserToken,
    userPassword
}