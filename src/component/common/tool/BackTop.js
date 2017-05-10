/**
 * Created by xiao on 2017/5/9.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './backTop.css';
const Easing = typeof window !== 'undefined' ? require('./ease-sential') : {};

class BackTop extends Component {
    constructor(props){
        super(props);
        this.state = {
            showBtn: false,
            fadeIn: false,
            fadeOut: false,
            scrollOver: true
        };
        this.scrollEvent = this.scrollEvent.bind(this);
        this.scrollTop = this.scrollTop.bind(this);
        this.onClick = this.onClick.bind(this);

    }
    componentDidMount(){
        const target = this.props.target();
        target.addEventListener('scroll', this.scrollEvent);
        const scrollTop = this.getScrollY(), visibilityHeight = this.props.visibilityHeight;
        if(scrollTop >= visibilityHeight){
            this.setState({showBtn: true});
        }else{
            this.setState({showBtn: false});
        }
    }
    scrollEvent(){
        const scrollTop = this.getScrollY(), visibilityHeight = this.props.visibilityHeight;
        if(!this.state.showBtn && scrollTop >= visibilityHeight){
            this.setState({
                showBtn: true, fadeIn: true, fadeOut: false
            });

        }else if(this.state.showBtn && scrollTop < visibilityHeight){
            this.setState({
                showBtn: false, fadeIn: false, fadeOut: true
            });
        }
    }
    scrollTop(y){
        const target = this.props.target();
        if(target === window){
            window.scrollTo(0, y);
        }else{
            target.scrollTop = y;
        }
        if(y == 0) this.setState({scrollOver: true});
    }
    onClick(){
        if(!this.state.showBtn) return;
        if(typeof this.props.onClick === 'function'){
            //回到顶部
            this.props.onClick();
        }
        this.scrollBackTop();

    }
    scrollBackTop(){
        if(!this.state.scrollOver) return;
        const scrollTop = this.getScrollY();
        this.setState({scrollOver: false});
        Easing.tween({
            from: scrollTop,
            to: 0,
            ease: Easing.easeOutCubic,
            duration: 750,
            onProgress: this.scrollTop,
        });
    }
    getScrollY(){
        const target = this.props.target();
        if(target === window){
            let y;
            if(window.pageYOffset){    // all except IE
                y = window.pageYOffset;
            }
            else if(window.document.documentElement && window.document.documentElement.scrollTop){    // IE 6 Strict
                y = window.document.documentElement.scrollTop;
            } else if(document.body){    // all other IE
                y = window.document.body.scrollTop;
            }
            return y;
        }else{
            return target.scrollTop;
        }
    }
    componentWillUnmount(){
        const target = this.props.target();
        target.removeEventListener('scroll', this.scrollEvent);
    }
    render(){
        const { fadeIn, fadeOut } = this.state;
        const backTopClass = classNames({
            backTop: true,
            fadeIn,
            fadeOut
        });
        return (
            <div className={backTopClass} onClick={this.onClick}>TOP</div>
        );
    }
}

BackTop.propTypes = {
    visibilityHeight: PropTypes.number,
    onClick: PropTypes.func,
    target: PropTypes.func
};

BackTop.defaultProps = {
    visibilityHeight: 400,
    target:  () => window
};

export default BackTop;