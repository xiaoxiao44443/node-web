/**
 * Created by xiao on 2017/5/11.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { store } from '../../../tool/store';
import { withRouter }  from 'react-router-dom';

import http from '../../../tool/http';

class PageComponent extends Component {

    constructor(props){
        super(props);
    }
    _pageInit(){
        let url = this.props.match.url;
        http.apiGet(url).then((res) => {
            this.props.history.replace(url,
                {
                    title: res.title,
                    init: res.data
            });
            if(res.code == 0){
                this.props.$store.update({articles: res.data});
            }else{
                alert('服务器返回异常');
            }
        });
    }
}
export default PageComponent;