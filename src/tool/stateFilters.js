/**
 * Created by xiao on 2018/2/20.
 */
//state添加用户信息
const addUserInfo = (state, Request) => {
    state.user = { nickname: Request.USER.nickname };
};

//state信息过滤
const AdminStateFilter = Request => {
    return (state = {}) => {
        addUserInfo(state, Request);
        return state;
    };
};

export {
    AdminStateFilter
};