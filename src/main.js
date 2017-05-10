/**
 * Created by xiao on 2017/3/8.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router-dom/BrowserRouter';
import Routes from './router/client/index';
import 'nprogress/nprogress.css';
import './common/common.css';
import './common/animate.css';

class Root extends Component {
    constructor(prop){
        super(prop);
        this.state = {
            isError: window.__data_init__ ? !!window.__data_init__.error : false
        }
    }
    componentDidMount(){
        window.__data_init__ = {};
        this.state.isError = false;
    }
    render(){
        return Routes(this.state.isError);
    }
}
ReactDOM.render(
    <Router>
        <Root/>
    </Router>,
    document.getElementById('app')
);