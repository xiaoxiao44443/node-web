/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component, PropTypes } from 'react';
import Header from '../../../component/front/new/common/Header';
import './blog.css';

import Footer from '../../../component/front/new/common/Footer';

import BackTop from '../../../component/common/tool/BackTop';

const Article = () => (
    <li className="article-item">
        <article>
            <div className="article-info">
                <div className="article-title">
                    <h3><a href="javascript:void(0);">【序章】Lolili Blog 更新中...</a></h3>
                </div>
                <div className="article-dateline">
                    发表于 2017-05-09 | 暂无分类
                </div>
                <div className="article-img">
                    <img src="/static/images/new/article-img.jpg"/>
                </div>
                <div className="article-summary">
                    <a href="javascript:void(0);">
                        <p>2017年05月09日更新 总算是把列表页大致做好了，好好做个页面对我半路子出家的我真是难啊，参考了一些别人的博客，也研究了下网页自适应，总算有了这个雏形。后边会继续完善我这第一个博客，四点了，该睡觉了zZ ...</p>
                    </a>
                </div>
            </div>
            <div className="article-oper">
                <span>阅读(1)</span>
                <span>评论(2)</span>
                <span><a href="javascript:void(0);">阅读全文>></a></span>
            </div>
        </article>
    </li>
);

class Blog extends Component {
    render(){
        const backGroundImg = '/static/images/new/blog-banner.jpg';
        return (
            <div className="main-wrap blog">
                <Header backGroundImg={backGroundImg} />
                <section className="blog-banner" style={{background: `url(${backGroundImg}) no-repeat center top`,
                    backgroundSize: "cover"}}>
                    <div className="layer" />
                    <div className="bg-mask" />
                </section>
                <section className="blog-wrap">
                    <div className="article-list bounceInUp animated">
                        <ul>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                            <Article/>
                        </ul>
                    </div>
                    <div className="blog-group bounceInRight animated">
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
                                        超有爱の
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <BackTop/>
                <Footer />
            </div>
        );
    }
}
export default Blog;