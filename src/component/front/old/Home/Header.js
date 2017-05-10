/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
class Header extends Component {
    render(){
        return (
            <header>
                <nav id="nav">
                    <ul>
                        <li><Link to="/">首页</Link></li>
                    </ul>
                </nav>
            </header>
        );
    }
}

export default Header;