/**
 * Created by xiao on 2017/5/11.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { store } from '../../../tool/store';
import { withRouter }  from 'react-router-dom';
import { getKeyInObject }  from '../../../tool/utils/object';

import http from '../../../tool/http';

class PageComponent extends Component {

    constructor(props){
        super(props);
    }
    _pageInit(){
        let url = this.props.match.url;
        if(this.props._page && this.props._page && this.props._page.url === url){
            const _page = this.props._page;
            this.setState(_page.state);
            this.props.$store.update({_page: false});
            this.props.history.replace(url, {title: document.title, init: _page.state})
        }else{
            const init = getKeyInObject(this.props, 'history.location.state.init');
            if(init){
                this.setState(init);
            }else{
                http.apiGet(url).then((res) => {
                    this.props.history.replace(url,
                        {
                            title: res.title,
                            init: res.data
                        });
                    if(res.code == 0){
                        this.setState(res.data)
                    }else{
                        alert('服务器返回异常');
                    }
                });
            }
        }
    }
    static withStore(WrappedComponent){
        const map = (state) => ({ _page: state._page });
        return store(WrappedComponent, map);
    }
}
export default PageComponent;