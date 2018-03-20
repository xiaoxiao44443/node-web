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
            groupPanelClosing: false,
            bannerLoaded: false,
            bannerAniOver: false,
            newCommentList: this.getCommentList()
        };
        this.showGroupPanel = this.showGroupPanel.bind(this);
    }
    componentDidMount(){
        this._isMounted = true;
        window.addEventListener('resize', this.onResize);
        this.bannerLoad();
        this.onResize();
    }
    componentWillUnmount(){
        this._isMounted = false;
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
            clearTimeout(this.t);
            this.t = setTimeout(() => {
                if (this._isMounted) this.setState({ groupPanelClosing: false });
            }, 1000);
        }
        this.setState({
            groupPanelVisible: !this.state.groupPanelVisible,
            groupPanelClosing: this.state.groupPanelVisible
        });

    }
    //banner模糊加载
    bannerLoad = () => {
        const bannerImg = this.props.bannerImg;
        const img = new Image();
        img.src = bannerImg;
        img.onload = this.bannerLoaded;
    };
    bannerLoaded = () => {
        if (this._isMounted) this.setState({bannerLoaded: true});
        setTimeout(() => {
            if (this._isMounted) this.setState({bannerAniOver: true});
        }, 1500);
    };
    render(){
        const { bannerImg, bannerImgThumbnail, className, bannerTitle} = this.props;
        const { bannerLoaded, bannerAniOver } = this.state;

        const { motto } = this.props;
        const { friends } = this.props;

        const { groupPanelVisible, groupPanelClosing, newCommentList } = this.state;
        const mainWrapClass = classNames({
            'main-wrap': true,
            blog: true,
            [className]: true,
            'group-panel-visible':groupPanelVisible,
            'group-panel-closing': groupPanelClosing
        });

        const blogGroupClass = classNames({
            'blog-group': true
        });

        let bannerBlurStyle = {
            backgroundImage: `url(${bannerImgThumbnail})`
        };

        let bannerStyle = {
            backgroundImage: bannerLoaded ? `url(${bannerImg})` : `url(${bannerImgThumbnail})`
        };

        const headerBackGroundImg = bannerLoaded ? bannerImg : bannerImgThumbnail;

        const bannerBlurClass = classNames({
            'blog-banner': true,
            'loading': true,
            'blur-fade-out': bannerLoaded
        });

        const bannerClass = classNames({
            'blog-banner': true
        });

        return (
            <div ref={div => this.mainWrap = div} className={mainWrapClass}
            >
                <Header backGroundImg={headerBackGroundImg} >
                    <div id="titleBar">
                        <a href="javascript:void(0);" className="toggleGroupPanel" onClick={this.showGroupPanel} />
                        <span className="title"><a href="/">LOLILI</a></span>
                    </div>
                </Header>
                <div className="blog-banner-wrap">
                    <div className="mask-layer">
                        <div className="layer fadeIn animated" >
                            <p>{bannerTitle}</p>
                        </div>
                    </div>
                    {<div className={bannerBlurClass} style={bannerBlurStyle}/>}
                    <section className={bannerClass} style={bannerStyle}/>
                </div>
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
    friends: PropTypes.array,
    bannerImg: PropTypes.string,
    bannerImgThumbnail: PropTypes.string,
    className: PropTypes.string,
    bannerTitle: PropTypes.string
};

BlogWrap.defaultProps = {
    newComments: [],
    friends: [],
    bannerImg: '/static/images/default/blog-banner.jpg',
    bannerImgThumbnail: '/static/images/default/banner-thumbnail.jpg',
    className: '',
    bannerTitle: ''
};

export default BlogWrap;