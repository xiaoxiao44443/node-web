/**
 * Created by xiao on 2017/3/8.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Router from 'react-router-dom/BrowserRouter';
import Routes from './router/client/index';
import './common/nprogress.css';
import './common/common.css';
import './common/animate.css';
import { Provider, store } from "./tool/store";
import { withRouter } from 'react-router-dom';
import Easing from './component/common/tool/ease-sential';
import { scroll2EleByHashID } from './tool/dom-js';
import { maxWidthPoint } from './enum';

class Root extends Component {
    constructor(props){
        super(props);
        this.unlisten = this.props.history.listen((location, action) => {
            //判断viewport
            if(location.pathname.indexOf('/admin') == 0){
                //后台固定宽度
                let viewport = document.querySelector("meta[name=viewport]");
                if(viewport){
                    document.getElementsByTagName('head')[0].removeChild(viewport);
                }
            }else{
                //前台其他页面自适应
                let viewport = document.querySelector("meta[name=viewport]");
                if(viewport === null){
                    let meta = document.createElement('meta');
                    meta.setAttribute('name', 'viewport');
                    meta.setAttribute('content', 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0');
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
            }

            if(action === 'REPLACE' && location.state){
                const state = location.state;
                if(state.title) document.title = state.title;
            }
            if(action === 'POP' && location.state){
                const state = location.state;
                this.props.$store.update({error: false});
                if(state.title) document.title = state.title;
            }

            if(location.hash!=''){
                //哈希跳转
                //滚动到指定元素位置
                if(action == 'POP'){
                    scroll2EleByHashID(location.hash);
                }
            }

            if(action === "PUSH" && location.hash===''){
                this.props.$store.update({error: false});
                window.scrollTo(0,0); //滚动条回到顶部
            }
        });
    }
    componentDidMount(){
        if(this.props.notFound || this.props.error) return;
        if(window.document.readyState && window.document.readyState !== 'complete'){
            window.onload = () => {
                const $el = window.document.getElementsByTagName('body')[0];
                $el.className = 'landing';
                setTimeout(() => $el.className = "", 1500);
            }
        }else{
            window.document.getElementsByTagName('body')[0].className = 'landing';
        }
    }
    componentWillUnmount(){
        this.unlisten();
    }
    render(){
        return Routes(this.props.error, this.props.notFound);
    }
}
Root.propTypes = {
    error: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
    ])
};
Root.defaultProps = {
    error: false
};
const map = (state) => ({ error : state.error, notFound: state.notFound });

Root = withRouter(store(Root, map));
ReactDOM.hydrate(
    <Provider>
        <Router>
            <Root/>
        </Router>
    </Provider>,
    document.getElementById('app')
);