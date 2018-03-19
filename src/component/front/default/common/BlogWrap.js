/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Header from './Header';
import './blogWrap.css';

import Footer from './Footer';
import BackTop from '../../../common/tool/BackTop';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { maxWidthPoint } from '../../../../enum';
import { getWindowScrollY } from '../../../../tool/dom-js';
import Friend from '../blog/Friend';

class BlogWrap extends Component {
    constructor(props){
        super(props);

        this.state = {
            groupPanelVisible: false,
            newCommentList: this.getCommentList()
        };
        this.showGroupPanel = this.showGroupPanel.bind(this);
    }
    componentDidMount(){
        window.addEventListener('resize', this.onResize);

    }
    componentWillUnmount(){
        window.removeEventListener('resize', this.onResize);
    }
    onResize = () => {
        const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;

        //小屏幕只显示2条最新评论
        let newCommentList = maxWidth < maxWidthPoint.medium ? this.getCommentList(2) : this.getCommentList();
        this.setState({newCommentList});
        if(this.refs.blogGroup){
            this.refs.blogGroup.className = 'blog-group' + (maxWidth > maxWidthPoint.medium ? ' bounceInRight animated' : '');
        }

    };
    getCommentList(count = false, props = false){
        const { newComments } = props ? props : this.props;
        let newCommentList = [];
        newComments.forEach((val, index) => {
            if(count && index > count - 1) return;
            let link = 'javascript:void(0);';
            switch (val.type){
                case 'article':
                    link = `/blog/ad${val.type_key}#comment-${val.id}`;
                    break;
                case 'message-board':
                    link = `/message-board/#comment-${val.id}`;
                    break;
            }
            newCommentList.push(
                <p style={{width: '100%'}} key={val.id}>
                    <Link to={link} title={`${val.nickname}：${val.content}`} onClick={this.showGroupPanel}><span>{val.nickname}：</span><span>{val.content}</span></Link>
                </p>
            );
        });
        return newCommentList;
    }
    componentWillReceiveProps(nextProps){
        const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
        //小屏幕只显示2条最新评论
        let newCommentList = maxWidth < maxWidthPoint.medium ? this.getCommentList(2, nextProps) : this.getCommentList(false, nextProps);
        this.setState({newCommentList});
    }
    showGroupPanel(){
        const mainWrap = this.mainWrap;
        if(!this.state.groupPanelVisible){
            const marginTop = - getWindowScrollY();
            mainWrap.style.position = 'fixed';
            mainWrap.style.marginTop = marginTop + 'px';
            this.marginTop = marginTop;
        } else {
            mainWrap.style.position = '';
            mainWrap.style.marginTop = '';
            window.scrollTo(0, - this.marginTop);
        }
        this.setState({
            groupPanelVisible: !this.state.groupPanelVisible
        });

    }
    render(){

        const bannerImg = this.props.bannerImg || '/static/images/default/blog-banner.jpg';
        const className = this.props.className || '';

        const { motto } = this.props;
        const { friends } = this.props;

        const { groupPanelVisible, newCommentList } = this.state;
        const mainWrapClass = classNames({
            'main-wrap': true,
            blog: true,
            [className]: true,
            'group-panel-visible':groupPanelVisible
        });

        const blogGroupClass = classNames({
            'blog-group': true
        });

        return (
            <div ref={div => this.mainWrap = div} className={mainWrapClass}
            >
                <Header backGroundImg={bannerImg} >
                    <div id="titleBar">
                        <a href="javascript:void(0);" className="toggleGroupPanel" onClick={this.showGroupPanel} />
                        <span className="title"><a href="/">LOLILI</a></span>
                    </div>
                </Header>
                <section className="blog-banner" style={{backgroundImage: `url(${bannerImg})`}}>
                    <div className="layer" />
                    <div className="bg-mask" />
                </section>
                <section className="blog-wrap">
                    {this.props.children}
                    <div className={blogGroupClass} ref="blogGroup">
                        <div className="blog-group-nav">
                            <nav>
                                <ul>
                                    <li><NavLink exact to="/" activeClassName="hover">首页</NavLink></li>
                                    <li><NavLink exact to="/blog" activeClassName="hover" onClick={this.showGroupPanel}>博客</NavLink></li>
                                    <li><NavLink exact to="/message-board" activeClassName="hover">友言</NavLink></li>
                                    <li><NavLink exact to="/about" activeClassName="hover">关于</NavLink></li>
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
                                        <p dangerouslySetInnerHTML={{__html: motto}} />
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
                                        <div style={{width: '100%'}}>{newCommentList}</div>
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
                                        <div className="story-intro">对！就是这种低调，如同吃了炫迈</div>
                                    </div>
                                    <div className="recommend-item-main">
                                        <Friend friends={friends} />
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

BlogWrap.propTypes = {
    newComments: PropTypes.array,
    friends: PropTypes.array
};

BlogWrap.defaultProps = {
    newComments: [],
    friends: []
};

export default BlogWrap;