/**
 * Created by xiao on 2017/5/13.
 */
import React, { Component } from 'react';
import './admin.css';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import './articleList.css';
import moment from 'moment';
import Spin from '../../../component/common/tool/Spin';

class ArticleItem extends Component {
    render(){
        const { data:article, articleDelete, articleStick } = this.props;
        const publishTime = moment(article.create_time*1000).format('YYYY-MM-DD HH:mm');
        return (
            <li>
                <div className="article-item-head">
                    {article.id}.  <a href={`/blog/ad${article.id}`} target="_blank">{article.title}</a>
                </div>
                <div className="article-other-info">
                    <span><a className="article-author">、  这不科学</a></span>
                    <span><a className="">{article.comments} Comments</a></span>
                    <span><a className="article-view-num">{article.views} Views</a></span>
                    <span><a className="article-date">{publishTime}</a></span>
                    <span><Link className="article-edit" to={`/admin/article/edit/ad${article.id}`} >编辑</Link></span>
                    <span><a className="article-delete" href="javascript:void(0);" onClick={() => {articleDelete(article.id)}}>删除</a></span>
                    <span className="stick-cont">
                        {
                            article.stick ? <a href="javascript:void(0);" className="article-stick-false"
                                            onClick={() => {articleStick(article.id)}}>取消置顶</a> :
                            <a href="javascript:void(0);" className="article-stick"
                               onClick={() => {articleStick(article.id)}}>置顶</a>
                        }
                    </span>
                </div>
            </li>
        );
    }
}

class ArticleList extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            articles: [],
            loadingMoreArticle: false,
            noMoreArticle: false
        };

        this._setDefaultState(state);
        this.articleDelete = this.articleDelete.bind(this);
        this.articleStick = this.articleStick.bind(this);
        this.loadMoreArticle = this.loadMoreArticle.bind(this);
    }
    //删除文章
    articleDelete(id){
        if(window.confirm('真的要删除这篇文章吗？')){
            const data = {
                ad: id
            };

            http.apiPost('/admin/article/delete', data).then(res => {
                if(res.code == 0){
                    alert('删除成功~');
                    this._pageUpdate();
                }else{
                    alert(res.data);
                }
            });
        }
    }
    articleStick(id){
        alert('暂未实现哦');
    }
    loadMoreArticle(){
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
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-article-list" /></Spin>
        }
        const { articles, loadingMoreArticle, noMoreArticle } = this.state;
        const articleList = articles.map((val) => {
            return <ArticleItem data={val} key={val.id}
                                articleDelete={this.articleDelete} articleStick={this.articleStick} />
        });

        const loadingMoreArticleTip = !loadingMoreArticle ? (!noMoreArticle ? '加载更多' :'已经到底了//~~') : '努力加载中//~~';
        const loadMore = <div className="load-more"><a href="javascript:void(0);" onClick={this.loadMoreArticle}>{loadingMoreArticleTip}</a></div>;
        return (
            <div className="admin-article-list slideInUp animated-fast">
                {
                    articleList.length > 0 ? <ul>{articleList}</ul> : null
                }
                {loadMore}
            </div>
        )
    }
}

export default PageComponent.withStore(ArticleList);