/**
 * Created by xiao on 2017/5/6.
 */
import React, { Component } from 'react';
import Status from './Status';

class NotFound extends Component {
    componentDidMount(){
        document.title = '404 Not Found';
    }
    render(){
        return (
            <Status code={404}>
                <div>
                    <h1>Sorry, can’t find that.</h1>
                </div>
            </Status>
        );
    }
}

export default NotFound;