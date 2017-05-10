/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import Header from '../../component/front/Home/Header';
import MainContent from '../../component/front/Home/MainContent';
import Footer from '../../component/front/Home/Footer';

class Home extends Component {
    render(){
        return (
            <div className="main-wrap">
                <Header/>
                <MainContent/>
                <Footer/>
            </div>
        );
    }
}
export default Home;