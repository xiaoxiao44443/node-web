/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';

import Side from './Side';
import BlogItem from './BlogItem';

class MainContent extends Component {
    render(){
        return (
            <div className="mainContent">
                <Side/>
                <BlogItem/>
            </div>
        );
    }
}

export default MainContent;