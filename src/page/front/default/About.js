/**
 * Created by xiao on 2018/3/15.
 */
import React, { Component } from 'react';
import './about.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import PageComponent from '../../../component/common/base/PageComponent';
import { maxWidthPoint } from '../../../enum';

import PicViewer from '../../../component/common/tool/PicViewer';

class About extends PageComponent {
    constructor(props){
        super(props);

        const state = {
            picViewerVisible: false
        };
        this._setDefaultState(state);
    }
    componentDidMount(){
        this.PicViewer =  new PicViewer(this.refs.aboutWrap);
    }
    componentWillUnmount(){
        this.PicViewer.destroy();
    }
    componentDidUpdate(){
        if(this.refs.aboutWrap){
            const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
            if(maxWidth > maxWidthPoint.medium){
                this.refs.aboutWrap.className = 'about-wrap bounceInUp animated';
            }
        }
    }
    render(){
        const { newComments, motto, friends } = this.state;
        const bannerImg = '/static/images/default/blog-banners/about.jpg';
        const bannerImgThumbnail = '/static/images/default/blog-banners/about-thumbnail.jpg';
        return (
            <BlogWrap className="about" bannerImg={bannerImg} bannerImgThumbnail={bannerImgThumbnail}
                      bannerTitle="let us go！！"
                      newComments={newComments} motto={motto} friends={friends}>
                <section ref="aboutWrap" className="about-wrap">
                    <section className="about-content">
                        <div className="mini-banner">
                            <img src="/static/images/default/about/7a73e73cb6f0488dad7beafcd4b9a445_th.jpg" data-ori="/static/images/default/about/7a73e73cb6f0488dad7beafcd4b9a445_th01.jpg" />
                        </div>
                        <div className="about-me">
                            <h2>关于本博客：</h2>
                            <p>本博客由我完全从零打造，功能并不是很完善，但会逐步完善。</p>
                            <br/>
                            <h2>关于我：</h2>
                            <p>一名喜欢动漫、小说、二次元并对技术乐此不疲的90后。</p>
                            <p>画画、写作、网站...什么都想搞，什么都懒的弄...</p>
                            <p>有需要联系的可以留言，会在第一时间收到并回复。</p>
                            <p>联系方式: QQ422291344</p>
                        </div>
                    </section>
                </section>
            </BlogWrap>
        );
    }
}
export default PageComponent.withStore(About);