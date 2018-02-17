/**
 * Created by xiao on 2017/5/13.
 */
import React, { Component } from 'react';
import './articleDetail.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import moment from 'moment';
import PageComponent from '../../../component/common/base/PageComponent';
import { maxWidthPoint } from '../../../enum';
import markdown from '../../../tool/markdown';
import ArticleComment from '../../../component/front/default/common/ArticleComment';
const Easing = typeof window !== 'undefined' ? require('../../../component/common/tool/ease-sential') : {};
import { scroll2ElementByClassName, scroll2EleByHashID } from '../../../tool/dom-js';

class ArticleDetail extends PageComponent {
    constructor(props){
        super(props);

        const state = {
            article: null
        };
        this._setDefaultState(state);
    }
    componentDidUpdate(){
        if(this.refs.articleWrap){
            const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
            this.refs.articleWrap.className = maxWidth > maxWidthPoint.medium ? 'bounceInUp animated' : '';
        }
    }
    onUpdate = () => {
        //从其他页面跳转过来滚动到内容部分 没有哈希值才跳转到内容部分
        if (this.props.location.hash !== '') return;
        this.setState({
            updateComment: false
        });
        scroll2ElementByClassName('article-detail-wrap', 0, 5000, 450);
    };
    scroll2Hash = () => {
        //跳转到指定哈希值元素
        if (this.props.location.hash === '') return;
        scroll2EleByHashID(this.props.location.hash, 0, 2000, 450);
    };
    render(){
        const { article, newComments, motto, friends, updateComment } = this.state;

        let articleContent;
        if(article){
            const article_detail = markdown.render(article.text);
            const publishTime = moment(article.create_time*1000).format('YYYY-MM-DD HH:mm');
            articleContent =
                <div ref="articleWrap">
                    <div className="article-info">
                        <div className="article-title">
                            <h3><span>{article.title}</span></h3>
                        </div>
                        <div className="article-dateline">
                            发表于 {publishTime} | 暂无分类
                        </div>
                    </div>
                    <div className="article-oper">
                        <span>阅读({article.views})</span>
                        <span>评论({article.comments})</span>
                    </div>
                    <div className="article-content article-html" dangerouslySetInnerHTML={{__html: article_detail}} />
                </div>
        }
        return (
            <BlogWrap className="article-detail" newComments={newComments} motto={motto} friends={friends}>
                <div className="article-detail-wrap">
                    {article === null ?
                    <div className="notFound">
                        <h1>正在努力加载中//~~</h1>
                        <a href="javascript:history.go(-1);" >返回</a>
                    </div>
                         :(
                        !article ?
                            <div className="notFound">
                                <h1>该文章不存在或已被删除!</h1>
                                <a href="javascript:history.go(-1);" >返回</a>
                            </div>
                            : articleContent
                    )}
                </div>
                { article !== null &&
                <ArticleComment type="article" type_key={article.id}
                                hashCommentHash={this.props.location.hash} onDidMount={this.scroll2Hash} /> }
            </BlogWrap>
        );
    }
}

export default PageComponent.withStore(ArticleDetail);