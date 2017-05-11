/**
 * Created by xiao on 2017/3/8.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Router from 'react-router-dom/BrowserRouter';
import Routes from './router/client/index';
import 'nprogress/nprogress.css';
import './common/common.css';
import './common/animate.css';
import { Provider, store } from "./tool/store";
import { withRouter } from 'react-router-dom';

class Root extends Component {
    constructor(props){
        super(props);
        this.state = {
            isError: !!props.error
        };

        this.unlisten = props.history.listen((location, action) => {
            if(action === "PUSH"){
                window.scrollTo(0,0); //滚动条回到顶部
            }
            if(action === 'REPLACE' && location.state){
                const state = location.state;
                if(state.title) document.title = state.title;
            }
            if(action === 'POP' && location.state){
                const state = location.state;
                if(state.title) document.title = state.title;
            }
        })
    }
    componentDidMount(){
        this.props.$store.update({error: false}, false);
    }
    componentWillReceiveProps(){
        this.setState({isError: false});
    }
    componentWillUnmount(){
        this.unlisten();
    }
    render(){
        return Routes(this.state.isError);
    }
}
Root.propTypes = {
    error: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
    ])
};
Root.defaultProps = {
    error: false
};
const map = ['error'];
Root = withRouter(store(Root, map));
ReactDOM.render(
    <Provider>
        <Router>
            <Root/>
        </Router>
    </Provider>,
    document.getElementById('app')
);