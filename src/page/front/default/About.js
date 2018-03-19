/**
 * Created by xiao on 2018/3/15.
 */
import React, { Component } from 'react';
import './about.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import PageComponent from '../../../component/common/base/PageComponent';
import { maxWidthPoint } from '../../../enum';

class About extends PageComponent {
    constructor(props){
        super(props);

        const state = {

        };
        this._setDefaultState(state);
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
        return (
            <BlogWrap className="about" bannerImg={bannerImg} newComments={newComments} motto={motto} friends={friends}>
                <div ref="aboutWrap" className="about-wrap">
                    <div className="title">
                        <a href="/static/images/default/about/66213344_p0.png" target="_blank">
                            <img src="/static/images/default/about/66213344_p0_1.png" />
                        </a>
                        <p>QQ:422291344</p>
                        <p>更多介绍暂无~</p>
                    </div>
                </div>
            </BlogWrap>
        );
    }
}

export default PageComponent.withStore(About);