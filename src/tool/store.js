/**
 * Created by xiao on 2017/3/8.
 */
import React from 'react';
let stores = {};

const store = (Component, map) => {
    if(typeof window !== 'undefined' && typeof window.__data_init__ === 'object' && map){
        return props => {
            let store = {};
            map.forEach((val) => {
                if(val in window.__data_init__) store[val] = window.__data_init__[val];
            });
            return <Component {...props} {...store}/>
        }
    }else{
        return props => <Component {...props} {...stores}/>;
    }
};

const configStore = (store) => {
    stores = store;
};

export{
    store, configStore
}