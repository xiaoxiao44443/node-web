/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import Header from '../../../component/front/new/common/Header';
import './home.css';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';

class Home extends PageComponent{
    componentDidMount(){
        this._pageInit();
    }
    render(){
        const backGroundImg = '/static/images/new/main-banner.jpg';
        return (
            <div className="main-wrap home">
                <Header backGroundImg={backGroundImg} />
                <section id="main-banner" style={{background: `url(${backGroundImg}) no-repeat center top`,
                    backgroundSize: "cover"}}>
                    <div className="layer">
                        <div className="motto">
                            <div className="wrap">
                                <h2>LOLILI~</h2>
                                <p>“只要你能幸福，我是谁，又有什么关系？<br/>记不记得住，又有什么关系啊！”</p>
                            </div>
                        </div>
                        <a href="javascript:void(0);" className="goto-next">Next</a>
                    </div>
                    <div className="bg-mask"/>
                </section>
            </div>
        );
    }
}

export default PageComponent.withStore(Home);