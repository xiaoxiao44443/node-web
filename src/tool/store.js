/**
 * Created by xiao on 2017/3/8.
 */
import React from 'react';
let stores = {};

class Provider extends React.Component {
    constructor(props){
        super(props);
        if(typeof window !== 'undefined' && typeof window.__data_init__ === 'object'){
            stores = window.__data_init__;
            delete window.__data_init__;
        }
    }
    render(){
        return this.props.children;
    }
}


const store = (Component, map) => {
    if(!Array.isArray(map)) throw new Error('store map must be an array!');
    return  (function () {
        let store = {};
        const _mapState = (state) =>{
            map.forEach((val) => {
                if(val in stores) {
                    if(typeof state === 'undefined'){
                        store[val] = stores[val]
                    }else{
                        if(val in state) store[val] = stores[val];
                    }
                }
            });
            return store;
        };

        return class extends React.Component{
            constructor(props){
                super(props);
                this.state = _mapState();
            }
            //局部store根据map同步
            mapState = _mapState;
            //改变全局stores
            /**
             * 更新状态仓库
             * @param state 状态
             * @param immediately 是否立即更新，否则在组件初始化才会有新的更新
             */
            update = (state, immediately = true) => {
                if(typeof state !=='object'){
                    throw new Error('state must be an object!');
                }
                for(let p in state){
                    stores[p] = state[p]
                }
                if(immediately) this.setState(this.mapState(state));
            };
            render(){
                const propsStore= { update: this.update };
                return <Component {...this.props} {...this.state} $store={propsStore}/>
            }
        };
    })();
};

// const Comp = (function () {
//     let _store = {};
//     const update = (store) => {
//         if(typeof store !=='object'){
//             throw new Error('store must be an object!');
//         }
//         for(let p in store){
//             _store[p] = store[p]
//         }
//     };
//     map.forEach((val) => {
//         if(val in stores) store[val] = stores[val];
//     });
//     return
//
// })();

// const store = (Component, map) => {
//     return props => {
//         let xxx = 11;
//         console.log(stores);
//         let store = {};
//         map.forEach((val) => {
//             if(val in stores) store[val] = stores[val];
//         });
//
//         return <Component {...props} {...store}/>
//     }
// };

const configStore = (store) => {
    stores = store;
};

export{
    store, configStore, Provider
}