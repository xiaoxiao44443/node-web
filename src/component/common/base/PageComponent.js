/**
 * Created by xiao on 2017/5/11.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { store } from '../../../tool/store';
import { withRouter }  from 'react-router-dom';
import { getKeyInObject }  from '../../../tool/utils/object';

import http from '../../../tool/http';

class PageComponent extends Component {

    constructor(props){
        super(props);
        const url = props.match.url;
        this._defaultState = {};
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
            const init = getKeyInObject(props, 'history.location.state.init');
            if(init){
                this.state = {
                    ...init,
                    _pageLoadOver: true
                };
            }
        }

    }
    componentDidMount(){
        this._pageInit();
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
    _pageInit(nextProps, initState = false){
        if(initState) {
            this.state = this._defaultState;
        }
        const props = nextProps || this.props;
        const url = props.match.url;
        if(!initState && props._page && props._page && props._page.url === url){
            const _page = props._page;
            props.history.replace(url, {title: document.title, init: _page.state});
            props.$store.update({_page: false});
        }else{

            const init = getKeyInObject(props, 'history.location.state.init');

            if(!init){
                this._pageUpdate();
            }else if(initState){
                this.setState({
                    ...init,
                    _pageLoadOver: true
                })
            }
        }
        props.$store.update({_history: {}});
    }

    //刷新本页数据
    _pageUpdate(initState = false){

        if(initState) {
            this.state = this._defaultState;
        }
        const url = this.props.match.url;

        http.apiGet(url).then((res) => {
            this.props.history.replace(url,
                {
                    title: res.title, init: res.data
                });
            if(res.code == 0){
                this.setState({
                    ...res.data,
                    _pageLoadOver: true
                })
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
        this.props.history.replace(url, { title: document.title, init: newState });
    }
    componentWillReceiveProps(nextProps){
        if(nextProps._history && (nextProps._history.action == 'PUSH' || nextProps._history.action == 'POP')){
            this.setState({
                _pageLoadOver: false
            });
            setTimeout(() => {this._pageInit(nextProps, true)}, 10);
        }
    }
    static withStore(WrappedComponent){
        const map = (state) => ({ _page: state._page, _history: state._history });
        return store(WrappedComponent, map);
    }
}
export default PageComponent;