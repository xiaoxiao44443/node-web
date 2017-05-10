/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import { store } from '../../../tool/store';
import { Link } from 'react-router-dom';
import { withRouter }  from 'react-router-dom';
import PropTypes from 'prop-types';
import http from '../../../tool/http';

class Article extends Component {
    jump2detail(){
       const { history, article } = this.props;
       history.push(`/article/ad${article.id}`);
    }
    render(){
        const article = this.props.article;
        return (
            <article>
                <h2 className="title">
                    <Link to={'/article/ad' + article.id}>{article.title}</Link>
                </h2>
                <ul className="text" dangerouslySetInnerHTML={{__html: article.text}}>
                </ul>
                <div className="textfoot">
                    <a href="javascript:void(0);" onClick={this.jump2detail.bind(this)}>阅读全文</a><a href="/">评论</a><a href="/">转载</a>
                </div>
            </article>
        );
    }
}

//传递react-router 信息给该组件
Article = withRouter(Article);

class BlogItem extends Component {
    constructor(prop){
        super(prop);
        this.state = {
            articles:  prop.articles
        }
    }
    componentDidMount(){
        if(this.state.articles.length == 0){
            let url = this.props.match.url;
            http.apiGet(url).then((res) => {
                if(res.code == 0){
                    document.title = '执子之手，与子偕老';
                    this.setState({articles: res.data});
                }else{
                    alert('服务器返回异常');
                }
            });
        }
    }
    render(){
        const articles = this.state.articles.map((val) => <Article key={val.id} article={val}/>);
        return (
            <div className="blogitem">
                {articles.length > 0 ? articles : '数据读取中...'}
                <div className="pages"><span>1</span><a href="/">2</a><a href="/" >3</a><a href="/" className="next">下一页&gt;&gt;</a></div>
            </div>
        );
    }
}

BlogItem.propTypes = {
    articles: PropTypes.array
};

BlogItem.defaultProps = {
    articles: []
};

const map = ['articles'];

export default withRouter(store(BlogItem,map));