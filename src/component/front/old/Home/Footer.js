/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';

class Footer extends Component {
    render(){
        return (
            <footer>
                <div className="footavatar">
                    <img src="/static/images/photo.jpg" className="footphoto"/>
                        <ul className="footinfo">
                            <p className="fname"><a href="/dancesmile" >青轻飞扬</a>  </p>
                            <p className="finfo">性别：xx 年龄：xx岁</p>
                            <p>现居：xxxx</p></ul>
                </div>
                <section className="visitor">
                    <h2>最近访客</h2>
                    <ul>
                        <li><a href="/"><img src="/static/images/s0.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s1.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s2.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s3.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s5.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s6.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s7.jpg"/></a></li>
                        <li><a href="/"><img src="/static/images/s8.jpg"/></a></li>
                    </ul>
                </section>
                <div className="Copyright">
                    <ul>
                        <a href="/">帮助中心</a><a href="/">空间客服</a><a href="/">投诉中心</a><a href="/">空间协议</a>
                    </ul>
                    <p>Design by DanceSmile</p>
                </div>
            </footer>
        );
    }
}

export default Footer;