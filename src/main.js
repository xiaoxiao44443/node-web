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
                if(action == 'PUSH' || action == 'REPLACE'){
                    setTimeout(() => scroll2EleByHashID(location.hash, 0, 2000), 100);
                }
                if(action == 'POP'){
                    scroll2EleByHashID(location.hash);
                }
            }

            if(action === "PUSH" && location.hash===''){
                this.props.$store.update({error: false});
                window.scrollTo(0,0); //滚动条回到顶部
                if(location.pathname.match(/^\/blog\/ad[0-9]+$/g)){

                    //博客详情页滚到内容部分，必须要用setTimeOut 不然获取不到dom
                    setTimeout(() => {
                        const $ele = document.getElementsByClassName('article-detail-wrap')[0];
                        if($ele) {
                            const headerHeight = document.getElementById('header').offsetHeight;
                            const intervalFunc = (start_time, overtime = 5000) => {
                                if(Date.now() > start_time + overtime) return;
                                if(document.body.offsetHeight - headerHeight >  window.screen.height){
                                    const targetY = window.document.body.offsetWidth <= maxWidthPoint.medium ? $ele.offsetTop - headerHeight : $ele.offsetTop;
                                    //手机端才需要减去导航高度
                                    Easing.tween({
                                        from: 0,
                                        to: targetY,
                                        ease: Easing.easeOutCubic,
                                        duration: 450,
                                        onProgress: (y) => {
                                            window.scrollTo(0, y)
                                        },
                                    });
                                    return;
                                }
                                setTimeout(intervalFunc,10, start_time);
                            };
                            //定时判断文档高度,文档高度大于banner高度才下拉，超时5秒
                            intervalFunc(Date.now());
                        }
                    },100);
                }
            }
        });
    }
    componentDidMount(){
        if(window.document.readyState && window.document.readyState !== 'complete'){
            window.onload = () => window.document.getElementsByTagName('body')[0].className = 'landing';
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
ReactDOM.render(
    <Provider>
        <Router>
            <Root/>
        </Router>
    </Provider>,
    document.getElementById('app')
);