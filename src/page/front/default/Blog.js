/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './blog.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import moment from 'moment';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import { maxWidthPoint } from '../../../enum';

class Article extends Component {
    render(){
        const { data:article } = this.props;
        const publishTime = moment(article.create_time*1000).format('YYYY-MM-DD HH:mm');
        return (
            <li className="article-item">
                <article>
                    <div className="article-info">
                        <div className="article-title">
                            <h3><Link to={`/blog/ad${article.id}`}>{article.title}</Link></h3>
                        </div>
                        <div className="article-dateline">
                            发表于 {publishTime} | 暂无分类
                        </div>
                        {parseInt(article.main_img) > 0 ?
                            <div className="article-img">
                                <img src={`/api/pic${article.main_img}`}/>
                            </div>: null
                        }
                        <div className="article-summary">
                            <Link to={`/blog/ad${article.id}`}>
                                <p>{article.summary}</p>
                            </Link>
                        </div>
                    </div>
                    <div className="article-oper">
                        <span>阅读({article.views})</span>
                        <span>评论({article.comments})</span>
                        <span><Link to={`/blog/ad${article.id}`}>阅读全文>></Link></span>
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

        const state = {
            articles: [],
            loadingMoreArticle: false,
            noMoreArticle: false
        };
        this._setDefaultState(state);
        this.loadMoreArticle = this.loadMoreArticle.bind(this);
    }
    componentDidUpdate(){
        if(this.refs.articleListWrap){
            const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
            if(maxWidth > maxWidthPoint.medium){
                this.refs.articleListWrap.className = 'article-list-wrap bounceInUp animated';
            }
        }
    }
    loadMoreArticle(){
        if(this.state.loadingMoreArticle) return;
        this.setState({
            loadingMoreArticle: true
        });
        const p = this.state.nowPage || 1;
        //加载更多文章
        const url = this.props.match.url;
        const data = {
            p: p + 1
        };
        http.apiPost(url, data).then((res) => {
            this.setState({
                loadingMoreArticle: false
            });
            if(res.code == 0){
                if(res.data.length == 0){
                    this.setState({
                        noMoreArticle: true
                    });
                    this._pageSave({
                        noMoreArticle: true
                    });
                    return;
                }
                const newArticles = this.state.articles.concat(res.data);
                this.setState({
                    articles: newArticles,
                    nowPage: p + 1,
                    noMoreArticle: false
                });
                this._pageSave({
                    articles: newArticles,
                    noMoreArticle: false,
                    nowPage: p + 1
                })
            }else{
                alert('服务器返回异常');
            }
        });

    }
    render(){
        const bannerImg = '/static/images/default/blog-banners/blog.jpg';
        const { articles } = this.state;
        const articleList = articles.map((val) => {
            return <Article data={val} key={val.id}/>
        });
        const { loadingMoreArticle, noMoreArticle, newComments, motto, friends } = this.state;
        const loadingMoreArticleTip = !loadingMoreArticle ? (!noMoreArticle ? '加载更多' :'已经到底了//~~') : '努力加载中//~~';
        const loadMore = <div className="load-more"><a href="javascript:void(0);" onClick={this.loadMoreArticle}>{loadingMoreArticleTip}</a></div>;
        return (
            <BlogWrap bannerImg={bannerImg} newComments={newComments} motto={motto} friends={friends}>
                <div className="article-list">
                    {
                        articleList.length == 0 ? loadMore :
                            <div ref="articleListWrap" className={'article-list-wrap'}>
                                <ul>
                                    {articleList}
                                </ul>
                                {loadMore}
                            </div>
                    }
                </div>
            </BlogWrap>
        );
    }
}
export default PageComponent.withStore(Blog);