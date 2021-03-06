/**
 * Created by xiao on 2017/5/11.
 */
import React, { Component } from 'react';
import { store } from '../../../tool/store';
import { getKeyInObject }  from '../../../tool/utils/object';

import http from '../../../tool/http';

class PageComponent extends Component {

    constructor(props){
        super(props);
        const url = props.match.url;
        this._defaultState = {};
        const componentDidMount = this.componentDidMount ? this.componentDidMount.bind(this) : () => {};

        //父类调用componentDidMount 同时调用子类componentDidMount
        this.componentDidMount = () => {
            this._pageInit();
            componentDidMount();
        };

        this.state = {
            _pageLoadOver: false
        };
        //在构造函数初始化可以避免由历史记录返回造成滚动条位置不准，但是代码复杂程度就高了，子类state初始化时必须包含父类的state，否则状态缺失
        if(props._page && props._page && props._page.url === url){
            const _page = props._page;
            this.state = {
                ..._page.state,
                _pageLoadOver: true
            };
        }else{
            //还是要有的，为了保证后退的流畅
            const init = getKeyInObject(props, 'history.location.state.init');
            if(init){
                this.state = {
                    ...init
                };
            }
        }

    }
    //必须用在constructor中
    _setDefaultState(state){
        this._defaultState = {
            ...state
        };
        this.state = {
            ...this._defaultState, ...this.state
        }
    }
    _pageInit(nextProps, initState){
        if(initState) {
            this.state = this._defaultState;
        }
        const props = nextProps || this.props;
        const url = props.match.url;
        if(props._page && props._page.url !== url){
            props.$store.update({_page: false});
        }
        if(!initState && props._page && props._page && props._page.url === url){
            const _page = props._page;
            props.history.replace(url + props.location.hash, {title: document.title, init: _page.state});
            props.$store.update({_page: false});

        }else{

            const init = getKeyInObject(props, 'history.location.state.init');

            if(!init){
                this._pageUpdate();
            }else{
                this.setState({
                    ...init,
                    _pageLoadOver: true
                })
            }
        }
    }

    //刷新本页数据
    _pageUpdate(initState = false){

        if(initState) {
            this.state = this._defaultState;
        }
        const url = this.props.match.url;

        http.apiGet(url).then((res) => {
            this.props.history.replace(url + this.props.location.hash,
                {
                    title: res.title, init: res.data
                });
            if(res.code == 0){
                const other = res.other;
                this.props.$store.update({ _page: { url, state: res.data, title: res.title }, ...other });
                this.setState({
                    ...res.data,
                    _pageLoadOver: true
                });
                if (typeof this.onUpdate == 'function') this.onUpdate();
            }else{
                alert('服务器返回异常');
            }
        });
    }

    _pageSave(state){
        let url = this.props.match.url;
        const init = getKeyInObject(this.props, 'history.location.state.init');
        let newState = init || state;
        if(init){
            for(let p in state){
                newState[p] = state[p]
            }
        }
        this.props.history.replace(url + this.props.location.hash, { title: document.title, init: newState });
    }
    componentWillReceiveProps(nextProps){
        if (nextProps.match.url!==this.props.match.url) {
            if (nextProps.history.action == 'PUSH' || nextProps.history.action == 'POP'){
                this.setState({
                    _pageLoadOver: false,
                    ...this._defaultState
                });
                //设置延时让组件render
                setTimeout(() => {this._pageInit(nextProps, true)}, 10);
            }
        } else {
            if (nextProps._page.state && nextProps._page.url == nextProps.match.url) {
                this.setState({ ...nextProps._page.state });
            }
        }
    }
    static withStore(WrappedComponent){
        const map = (state) => ({ _page: state._page });
        return store(WrappedComponent, map);
    }
}
export default PageComponent;