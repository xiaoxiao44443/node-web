/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../component/front/new/common/Header';
import './blog.css';

import { store } from '../../../tool/store';
import Footer from '../../../component/front/new/common/Footer';
import BackTop from '../../../component/common/tool/BackTop';
import moment from 'moment';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';

class Article extends Component {
    render(){
        const { data:article } = this.props;
        const publishTime = moment(article.create_time*1000).format('YYYY-MM-DD HH:mm');
        return (
            <li className="article-item">
                <article>
                    <div className="article-info">
                        <div className="article-title">
                            <h3><a href="javascript:void(0);">{article.title}</a></h3>
                        </div>
                        <div className="article-dateline">
                            发表于 {publishTime} | 暂无分类
                        </div>
                        <div className="article-img">
                            <img src={`/api/pic${article.main_img}`}/>
                        </div>
                        <div className="article-summary">
                            <a href="javascript:void(0);">
                                <p>{article.summary}</p>
                            </a>
                        </div>
                    </div>
                    <div className="article-oper">
                        <span>阅读({article.views})</span>
                        <span>评论({article.comments})</span>
                        <span><a href="javascript:void(0);">阅读全文>></a></span>
                    </div>
                </article>
            </li>
        );
    }
}
Article.propTypes = {
    data: PropTypes.object
};

class Blog extends PageComponent {
    constructor(props){
        super(props);
    }
    componentDidMount(){
        this._pageInit();
    }
    render(){
        const backGroundImg = '/static/images/new/blog-banner.jpg';
        const { articles } = this.props;
        const articleList = articles.map((val) => {
            return <Article data={val} key={val.id}/>
        });
        return (
            <div className="main-wrap blog">
                <Header backGroundImg={backGroundImg} />
                <section className="blog-banner" style={{background: `url(${backGroundImg}) no-repeat center top`,
                    backgroundSize: "cover"}}>
                    <div className="layer" />
                    <div className="bg-mask" />
                </section>
                <section className="blog-wrap">
                    <div className="article-list">
                        {
                            articleList.length == 0 ? null :
                            <ul className="bounceInUp animated">
                                {articleList}
                            </ul>
                        }
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
                                        超有爱
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

Blog.propTypes = {
    articles: PropTypes.array
};

Blog.defaultProps = {
    articles: []
};

const map = ['articles'];

export default store(Blog, map);