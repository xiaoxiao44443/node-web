/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';

class Side extends Component {
    render(){
        return (
            <aside>
                <div className="avatar">
                    <a href="#"><span>青轻飞扬</span></a>
                </div>
                <section className="topspaceinfo">
                    <h1>执子之手，与子偕老</h1>
                    <p>于千万人之中，我遇见了我所遇见的人....</p>
                </section>
                <div className="userinfo">
                    <p className="q-fans"> 粉丝：<a href="/" target="_blank">167</a></p>
                    <p className="btns"><a href="/" target="_blank" >私信</a><a href="/" target="_blank">相册</a><a href="/" target="_blank">存档</a></p>
                </div>
                <section className="newpic">
                    <h2>最新照片</h2>
                    <ul>
                        <li><a href="/"><img src="/static/images/01.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/02.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/03.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/04.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/05.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/06.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/07.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/08.jpg"/></a></li>
                    </ul>
                </section>
                <section className="taglist">
                    <h2>全部标签</h2>
                    <ul>
                        <li><a href="/">青空</a></li>
                        <li><a href="/">情感聊吧</a></li>
                        <li><a href="/">study</a></li>
                        <li><a href="/">青青唠叨</a></li>
                    </ul>
                </section>
            </aside>
        );
    }
}

export default Side;