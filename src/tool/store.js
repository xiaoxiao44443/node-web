/**
 * Created by xiao on 2017/3/8.
 */
import React, { createElement, Children } from 'react';
import PropTypes from 'prop-types';
import he from 'he';

//取消转义html
const unescape = (target) => {
    if (Array.isArray(target)) {
        let ret = [];
        for (let p of target) {
            ret.push(unescape(p));
        }
        return ret;
    }
    else if (typeof target === 'object') {
        let ret = {};
        for (let p in target) {
            ret[p] = unescape(target[p]);
        }
        return ret;
    }
    else if (typeof target == 'string') {
        return he.unescape(target)
    }
    else {
        return target;
    }
};
let stores = {};
class Provider extends React.Component {
    //改变全局stores
    /**
     * 更新状态仓库
     * @param state 状态
     */
    update = state => {
            if(typeof state !=='object'){
                throw new Error('state must be an object!');
            }
            for(let p in state){
                stores[p] = state[p]
            }
            this.setState({store: stores});
    };
    getChildContext(){
        return {
            store: this.state.store,
            propStore: {
                update: this.update
            }
        };
    }
    constructor(props, context){
        super(props, context);
        if(typeof window !== 'undefined' && typeof window.__data_init__ === 'object'){
            stores = unescape(window.__data_init__);

            delete window.__data_init__;
        }
        this.state = {
            store: stores
        };
    }
    render(){
        return Children.only(this.props.children);
    }
}
Provider.childContextTypes = {
    store: PropTypes.object,
    propStore: PropTypes.object
};
Provider.propTypes = {
    children: PropTypes.element.isRequired
};
Provider.displayName = 'Provider';


const store = (WrappedComponent, map) => {
    if(typeof map !== 'function') throw new Error('store map must be a function!');

    const _mapState = store =>{
        return map(store);
    };

    class Wrap extends React.Component{
        getChildContext(){
            return {
                store: this.context.store,
                propStore: this.context.propStore
            }
        }
        constructor(props, context){
            super(props, context);
        }
        render(){
            if(!this.context.store || !this.context.propStore) return null;
            const { store, propStore } = this.context;
            const state = _mapState(store);
            const props = {
                ...this.props,
                ...state,
                $store: propStore
            };
            return  createElement(WrappedComponent, props)
        }
    }
    Wrap.contextTypes = {
        store: PropTypes.object,
        propStore: PropTypes.object
    };
    Wrap.childContextTypes = {
        store: PropTypes.object,
        propStore: PropTypes.object
    };
    return Wrap;
};

const configStore = (store) => {
    stores = store;
};

export{
    store, configStore, Provider
}