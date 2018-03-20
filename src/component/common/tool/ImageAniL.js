/**
 * Created by xiao on 2018/3/20.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * 图片动画加载助手
 */
class ImageAniL extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        console.log(this.props.children);
    }
    render() {
        return React.Children.only(this.props.children);
    }
}

export default ImageAniL;