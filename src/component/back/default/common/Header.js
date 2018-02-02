/**
 * Created by xiao on 2017/5/13.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import http from '../../../../tool/http';

class Header extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false
        };
    }
    logout = (event) => {
        event.preventDefault();

        if(this.state.loading) return;
        this.setState({
            loading: true
        });

        http.apiGet('/logout').then(res => {
            this.setState({
                loading: false
            });
            if(res.code == 0){
                alert(res.data);
                setTimeout(() => {
                    window.location.reload();
                },500);
            }else{
                alert('服务器返回异常');
            }
        });
    };
    render(){
        const { toggle, user } = this.props;
        return (
            <header id="admin-header">
                <div className="sidebar-toggle-box">
                    <div id="tool-bar" className="icon-reorder tooltips" onClick={toggle} />
                </div>
                <a href="/admin" className="logo">LOLILI<span>管理中心</span></a>
                <nav id="admin-header-nav">
                    <div className="user">
                        <span className="user-name">{user.nickname} <span className="well">欢迎你！</span></span>
                        <Link to="/admin/logout" onClick={this.logout}>退出</Link>
                    </div>
                    <ul>
                        <li><Link to="/">首页</Link></li>
                        <li><Link to="/blog">博客</Link></li>
                    </ul>
                </nav>
            </header>
        );
    }
}

export default Header;