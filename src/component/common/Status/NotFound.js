/**
 * Created by xiao on 2017/5/6.
 */
import React, { Component } from 'react';
import Status from './Status';
import './NotFound.css';

class NotFound extends Component {
    componentDidMount(){
        document.title = '404 Not Found';
    }
    render(){
        return (
            <Status code={404}>
                <div className="page404-wrap">
                    <div className="container">
                        <div className="text-wrap">
                            <div id="head">404!</div>
                            <div id="words">页面，我找不到你，我找不到你啊~</div>

                        </div>
                        <div className="image-wrap">
                            <img src="/static/images/default/404.png" />
                        </div>
                    </div>
                </div>
            </Status>
        );
    }
}

export default NotFound;