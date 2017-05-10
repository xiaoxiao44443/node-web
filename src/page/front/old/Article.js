/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { store } from '../../tool/store';
import Header from '../../component/front/Home/Header';
import Footer from '../../component/front/Home/Footer';
import http from '../../tool/http';
import './article.css';

class Article extends Component {
    constructor(prop){
        super(prop);
        this.state = {
            article_detail:  prop.article_detail
        }
    }
    componentDidMount(){
        if(this.state.article_detail === null){
            let url = this.props.match.url;
            http.apiGet(url).then((res) => {
                if(res.code == 0){
                    document.title = res.data.title;
                    this.setState({article_detail: res.data});
                }else{
                    alert('服务器返回异常');
                }
            });
        }
    }
    render(){
        const article = this.state.article_detail;
        return article === null ?
            (
                <div className="main-wrap">
                    <Header/>
                    <div className="article-wrap">数据读取中。。。</div>
                    <Footer/>
                </div>
            ):
            (
                <div className="main-wrap">
                    <Header/>
                    <div className="article-wrap">
                        <h2 className="title"><a href="javascript:void(0);">陌上花开，可缓缓归矣</a></h2>
                        <div className="text" dangerouslySetInnerHTML={{__html: article.text}} />
                    </div>
                    <Footer/>
                </div>
            )
    }
}

Article.propTypes = {
    article_detail: PropTypes.object
};

Article.defaultProps = {
    article_detail: null
};

const map = ['article_detail'];

export default store(Article,map);