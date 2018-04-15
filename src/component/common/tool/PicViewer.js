
/**
 * Created by xiao on 2018/3/21.
 */
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './picViewer.css';
import classNames from 'classnames';
import {getWindowScrollY} from '../../../tool/dom-js';

class PicViewer {
    constructor($el) {
        this.el = $el;
        $el.addEventListener('click', this.showPicViewer);
    }
    showPicViewer = e => {
        if (e.target.nodeName == 'IMG') {
            let image = e.target;
            const src = image.src;
            const oriSrc = image.getAttribute('data-ori') || src;
            const bounding = image.getBoundingClientRect();
            this.picViewer = this.el = document.createElement('div');
            this.picViewer.className = 'pic-viewer';
            document.getElementsByTagName('body')[0].appendChild(this.picViewer);
            const size = {
                w: image.offsetWidth,
                h: image.offsetHeight,
                x: bounding.x,
                y: bounding.y
            };

            ReactDOM.render(
                <PicViewerInner imageOri={oriSrc} imageSrc={src} imageSize={size} el={this.picViewer} imgNode={image}/>,
                this.picViewer
            );
        }
    };
    destroy = () => {
        this.el.removeEventListener('click', this.showPicViewer);
        const $body = document.getElementsByTagName('body')[0];
        if ($body.contains(this.picViewer)){
            document.getElementsByTagName('body')[0].removeChild(this.picViewer);
        }
        delete this.el;
        delete this.picViewer;
    }
}

class PicViewerInner extends Component {
    state = {
        loadOver: false,
        loading: true,
        picInit: false,
        maxSize: false,
        scaleShow: false,
        scaleOut: false
    };
    scrollY = false;
    componentDidMount() {
        this.props.imgNode.style.visibility = 'hidden';
        this.setState(this.calcSize());
        this.loadPic();
        this.props.el.addEventListener('touchmove', this.close, false);
        this.props.el.addEventListener('click', this.close);
        this.scrollY = getWindowScrollY();
        window.addEventListener('mousewheel', this.close);
    }
    loadPic = () => {
        let image = new Image();
        image.src = this.props.imageOri;
        if (image.complete === false) {
            image.onload = this.loadPicOver;
        } else {
            this.calcMaxSize({
                w: image.width,
                h: image.height
            });
            this.setState({
                loading: false,
                loadOver:true
            });
            this.scaleShow();
        }

        return {
            w: image.width,
            h: image.height
        };
    };
    loadPicOver = e => {
        this.calcMaxSize({
            w: e.target.width,
            h: e.target.height
        });
        this.setState({
            loading: false,
            loadOver:true
        });
        this.scaleShow();
    };
    calcSize = () => {
        const { imageSize } = this.props;
        const picViewer = this.picViewer;
        const w = picViewer.offsetWidth;
        const h = picViewer.offsetHeight;
        const bounding = picViewer.getBoundingClientRect();

        const scale = imageSize.w / imageSize.h;
        let _nw = h * scale > w ? w : parseInt(h * scale);
        let _nh = parseInt(_nw / scale);

        const maxSize = {
            w: _nw,
            h: _nh,
            x: (w - _nw) / 2 + bounding.x,
            y: (h - _nh) / 2 + bounding.y
        };

        if (imageSize.w <= w && imageSize.h <= h) {
            return { picInit: imageSize, maxSize };
        } else {
            return { picInit: maxSize, maxSize };
        }
    };
    //不超过原始图大小
    calcMaxSize = orImageSize => {
        let { maxSize } = this.calcSize();
        if (maxSize.w > orImageSize.w ) {
            const picViewer = this.picViewer;
            const w = picViewer.offsetWidth;
            const h = picViewer.offsetHeight;
            const bounding = this.picViewer.getBoundingClientRect();
            const
            maxSize = {
                w: orImageSize.w,
                h: orImageSize.h,
                x: (w - orImageSize.w) / 2 + bounding.x,
                y: (h - orImageSize.h) / 2 + bounding.y

            };

            this.setState({ maxSize });
        }
    };
    close = e => {
        if (e)  e.preventDefault();
        if (this.t) return false;
        window.scrollTo(0, this.scrollY);
        this.scaleOut();
        this.t = setTimeout(() => {
            this.removeAllEventListener();
            document.getElementsByTagName('body')[0].removeChild(this.props.el);
            this.props.imgNode.style.visibility = '';
        }, 500);
        return false;
    };
    removeAllEventListener = () => {
        document.removeEventListener('touchmove', this.close, false);
        window.removeEventListener('mousewheel', this.close);
        this.props.el.removeEventListener('click', this.close);
    };
    componentWillReceiveProps(nextProps) {
        if (!nextProps.visible && this.props.visible) {
            this.scaleOut();
        }
    }
    scaleShow() {
        setTimeout(() => {
            this.setState({
                scaleShow: true
            });
        }, 50);
    }
    scaleOut() {
        this.props.el.style.animation = 'colorFadeOut .5s ease forwards';
        setTimeout(() => {
            this.setState({
                scaleShow: false,
                scaleOut: true
            });
        }, 50);
    }
    render() {
        if (!this.props.visible) return null;
        const { loadOver, picInit, maxSize, scaleShow, scaleOut } = this.state;
        const { imageOri, imageSrc, imageSize } = this.props;
        const loadCls = classNames({
            'loading-container': true,
            'out': loadOver
        });
        let picStyle = {
            display: picInit ? 'block' : 'none',
            width: picInit.w,
            height: picInit.h,
            position: 'absolute',
            left: imageSize.x,
            top: imageSize.y,
            transformOrigin: 'left top'
        };

        const imgSrc = loadOver ? imageOri: imageSrc;

        if (loadOver) {
            const scale = picInit.w / maxSize.w;

            picStyle.width = maxSize.w;
            picStyle.height = maxSize.h;
            picStyle.transformOrigin = 'left top';

            if (scaleShow || scaleOut) {
                picStyle.transition = 'transform ease .5s';
            }

            picStyle.transform = scaleShow ? `scale3d(1,1,1) translate3d(${maxSize.x - imageSize.x }px,${maxSize.y - imageSize.y}px,0)` :
                `scale3d(${scale}, ${scale}, 1) translate3d(0,0,0)`;

        }

        return (
            <div ref={div => this.picViewer = div} className="pic-viewer-wrap">
                <div className={loadCls}>
                    <div className="loading"/>
                </div>
                <img className="pic" src={imgSrc} style={picStyle}/>
            </div>
        );
    }
}

PicViewerInner.propTypes = {
    imageOri: PropTypes.string.isRequired,
    imageSrc: PropTypes.string.isRequired,
    imageSize: PropTypes.object.isRequired,
    visible: PropTypes.bool,
    el: PropTypes.object.isRequired,
    imgNode: PropTypes.object.isRequired
};
PicViewerInner.defaultProps = {
    visible: true
};

export default PicViewer;