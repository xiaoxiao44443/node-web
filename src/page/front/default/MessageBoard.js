/**
 * Created by xiao on 2018/3/15.
 */
import React, { Component } from 'react';
import './messageboard.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import PageComponent from '../../../component/common/base/PageComponent';
import ArticleComment from '../../../component/front/default/common/ArticleComment';
import { scroll2ElementByClassName, scroll2EleByHashID } from '../../../tool/dom-js';
import { maxWidthPoint } from '../../../enum';

class MessageBoard extends PageComponent {
    constructor(props){
        super(props);

        const state = {

        };
        this._setDefaultState(state);
    }
    componentDidUpdate(){
        if(this.refs.messageBoardAni){
            const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
            if(maxWidth > maxWidthPoint.medium){
                this.refs.messageBoardAni.className = 'message-board-ani bounceInUp animated';
            }
        }
    }
    scroll2Hash = () => {
        //跳转到指定哈希值元素
        if (this.props.location.hash === '') return;
        setTimeout(() => scroll2EleByHashID(this.props.location.hash, 0, 2000, 450), 100);
    };
    render(){
        const { newComments, motto, friends } = this.state;
        const bannerImg = '/static/images/default/blog-banners/message-board.jpg';
        const bannerImgThumbnail = '/static/images/default/blog-banners/message-board-thumbnail.jpg';
        return (
            <BlogWrap className="message-board" bannerImg={bannerImg} bannerImgThumbnail={bannerImgThumbnail}
                      bannerTitle="有朋自远方来 不亦说乎？"
                      newComments={newComments} motto={motto} friends={friends}>
                <div ref="messageBoardAni" className="message-board-ani">
                    <div className="message-board-wrap">
                        <div className="title">
                            <h2>这里是留言板~</h2>
                        </div>
                    </div>
                    <ArticleComment type="message-board" type_key={1}
                                    hashCommentHash={this.props.location.hash} onDidMount={this.scroll2Hash} />
                </div>
            </BlogWrap>
        );
    }
}

export default PageComponent.withStore(MessageBoard);