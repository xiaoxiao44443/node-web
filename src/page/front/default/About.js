/**
 * Created by xiao on 2018/3/15.
 */
import React, { Component } from 'react';
import './about.css';

import BlogWrap from '../../../component/front/default/common/BlogWrap';
import PageComponent from '../../../component/common/base/PageComponent';

class About extends PageComponent {
    constructor(props){
        super(props);

        const state = {

        };
        this._setDefaultState(state);
    }
    render(){
        const { newComments, motto, friends } = this.state;
        return (
            <BlogWrap className="about" newComments={newComments} motto={motto} friends={friends}>
                <div className="about-wrap">
                    <div className="title">
                        <a href="/static/images/default/about/66213344_p0.png" target="_blank">
                            <img src="/static/images/default/about/66213344_p0_1.png" />
                        </a>
                        <p>更多介绍暂无~</p>
                    </div>
                </div>
            </BlogWrap>
        );
    }
}

export default PageComponent.withStore(About);