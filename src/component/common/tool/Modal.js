/**
 * Created by xiao on 2017/5/16.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './rodal.css';
import Rodal from './rodal';

//添加react元素到body,并且自动渲染
class Modal extends Component {
    appendMaskIntoDoc() {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            <Rodal {...this.props}>
                {this.props.children}
            </Rodal>,
            this.container
        )
    }
    componentDidMount(){
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        this.appendMaskIntoDoc();
    }
    componentDidUpdate(){
        this.appendMaskIntoDoc();
    }
    componentWillUnmount(){
        ReactDOM.unmountComponentAtNode(this.container);
        document.body.removeChild(this.container);
    }

    render(){
        return null;
    }
}

export default Modal;