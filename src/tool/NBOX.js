/**
 * Created by xiao on 2017/2/16.
 */
import React from 'react';

if(typeof window !=='undefined'){
    window.NBOX = {
        map: {},
        autoRun: [],
        method: {} //{name:{func,num}}
    };
}

//@autoRun decorator装饰者模式
export const autoRun = (target, prop, descriptor) => {
    if(typeof descriptor.value !== 'function'){
        console.warn('please decorate on method');
        return null;
    }
    if(typeof window !=='undefined') window.NBOX.method[target.constructor.name] = {func: descriptor.value};
};

//@observer decorator装饰者模式
export const observer = (target, prop, descriptor) => {
    return class extends target {
        constructor(props){
            super(props);
            if(typeof window !=='undefined'){
                let func = undefined;
                for(let p in window.NBOX.method){
                    if(p == target.prototype.constructor.name){
                        func = window.NBOX.method[p].func;
                        delete window.NBOX.method[p];
                        break;
                    }
                }
                window.NBOX.autoRun.push({target: this,
                    name: target.prototype.constructor.name,
                    condition:function () {},
                    autoRun: func
                });
            }
        }
        componentWillMount(){
            if(typeof window !=='undefined'){
                window.NBOX.autoRun.forEach((o,i)=>{
                    if(o.name == target.prototype.constructor.name){
                        window.NBOX.autoRun[i].target = this;
                    }
                });
                if(typeof target.prototype.componentWillMount === 'function'){
                    target.prototype.componentWillMount();
                }
            }
        }
    };
};

//@observable decorator装饰者模式
export const observable = (target, prop, descriptor) => {
    let {initializer} = descriptor;
    delete descriptor.initializer;
    delete descriptor.writable;

    if(typeof window !=='undefined'){
        descriptor.set = function(newValue){
            for(let p of window.NBOX.autoRun){
                window.NBOX.map[prop] = newValue;
                if(typeof p.autoRun === 'function'){
                    p.autoRun.apply(p.target,[prop, newValue]);
                }
            }
            return newValue;
        };
        descriptor.get = function(){
            return  window.NBOX.map[prop];
        };
    }

    return descriptor;
};
