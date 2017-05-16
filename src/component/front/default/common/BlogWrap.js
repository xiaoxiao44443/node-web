/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component } from 'react';
import Header from './Header';
import './blogWrap.css';

import Footer from './Footer';
import BackTop from '../../../common/tool/BackTop';
import http from '../../../../tool/http';
import PageComponent from '../../../common/base/PageComponent';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { maxWidthPoint } from '../../../../enum';

class BlogWrap extends Component {
    constructor(props){
        super(props);

        this.state = {
            groupPanelVisible: false,
            marginTop: 0,
        };
        this.showGroupPanel = this.showGroupPanel.bind(this);
    }
    componentDidUpdate(prevProps, prevState){
        if(prevState.groupPanelVisible && !this.state.groupPanelVisible){
            //groupPanel关闭已渲染完毕
            window.scrollTo(0, - this.state.marginTop);
        }
    }
    showGroupPanel(){
        if(!this.state.groupPanelVisible){
            this.setState({
                marginTop:  - window.window.document.body.scrollTop
            });
        }
        this.setState({
            groupPanelVisible: !this.state.groupPanelVisible
        });

    }
    render(){
        const maxWidth = typeof window === 'undefined' ? false : window.screen.width;
        const backGroundImg = this.props.backGroundImg || '/static/images/default/blog-banner.jpg';
        const className = this.props.className || '';

        const { groupPanelVisible } = this.state;
        const mainWrapClass = classNames({
            'main-wrap': true,
            blog: true,
            [className]: true,
            'group-panel-visible':groupPanelVisible
        });

        const blogGroupClass = classNames({
            'blog-group': true,
            'bounceInRight animated': maxWidth > maxWidthPoint.large
        });

        return (
            <div className={mainWrapClass} onTouchMove={this.marinWrapOnTouchMove} style={
                groupPanelVisible ? {marginTop: this.state.marginTop}  : null}
            >
                <Header backGroundImg={backGroundImg} >
                    <div id="titleBar">
                        <a href="javascript:void(0);" className="toggleGroupPanel" onClick={this.showGroupPanel} />
                        <span className="title"><a href="https://lolili.cc">LOLILI</a></span>
                    </div>
                </Header>
                <section className="blog-banner" style={{background: `url(${backGroundImg}) no-repeat center top`,
                    backgroundSize: "cover"}}>
                    <div className="layer" />
                    <div className="bg-mask" />
                </section>
                <section className="blog-wrap">
                    {this.props.children}
                    <div className={blogGroupClass}>
                        <div className="blog-group-nav">
                            <nav>
                                <ul>
                                    <li><NavLink exact to="/" activeClassName="hover">首页</NavLink></li>
                                    <li><NavLink exact to="/blog" activeClassName="hover">博客</NavLink></li>
                                </ul>
                            </nav>
                        </div>
                        <div className="recommend-item">
                            <div className="recommend-item-inner">
                                <div className="recommend-item-container">
                                    <div className="recommend-item-header">
                                        <span className="name">本日の格言</span>
                                        <div className="story-intro">博主闪亮登场！</div>
                                    </div>
                                    <div className="recommend-item-main">
                                        <p>
                                            “只要你能幸福，我是谁，又有什么关系？<br/>
                                            记不记得住，又有什么关系啊！”
                                        </p>
                                    </div>
                                    <span className="recommend-item-more">
                                        超想说
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="recommend-item">
                            <div className="recommend-item-inner">
                                <div className="recommend-item-container">
                                    <div className="recommend-item-header">
                                        <span className="name">新の留言</span>
                                        <div className="story-intro">博主闪亮登场！</div>
                                    </div>
                                    <div className="recommend-item-main">
                                        <p>
                                            “只要你能幸福，我是谁，又有什么关系？<br/>
                                            记不记得住，又有什么关系啊！”
                                        </p>
                                    </div>
                                    <span className="recommend-item-more">
                                        超想看
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="recommend-item">
                            <div className="recommend-item-inner">
                                <div className="recommend-item-container">
                                    <div className="recommend-item-header">
                                        <span className="name">博主の友人</span>
                                        <div className="story-intro">博主闪亮登场！</div>
                                    </div>
                                    <div className="recommend-item-main">
                                        <p>
                                            “只要你能幸福，我是谁，又有什么关系？<br/>
                                            记不记得住，又有什么关系啊！”
                                        </p>
                                    </div>
                                    <span className="recommend-item-more">
                                        超有爱
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <BackTop/>
                <Footer />
                <div className="main-mask" style={{display: groupPanelVisible ? 'block' : 'none'}}
                     onClick={this.showGroupPanel}
                />
            </div>
        );
    }
}
export default BlogWrap;