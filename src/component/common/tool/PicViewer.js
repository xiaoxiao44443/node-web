
/**
 * Created by xiao on 2018/3/21.
 */
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './picViewer.css';
import classNames from 'classnames';

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
            this.el = this.el = document.createElement('div');
            this.el.className = 'pic-viewer';
            document.getElementsByTagName('body')[0].appendChild(this.el);
            const size = {
                w: image.offsetWidth,
                h: image.offsetHeight,
                x: bounding.x,
                y: bounding.y
            };

            ReactDOM.render(
                <PicViewerInner imageOri={oriSrc} imageSrc={src} imageSize={size} el={this.el}/>,
                this.el
            );
        }
    };
    destroy = () => {
        this.el.removeEventListener('click', this.showPicViewer);
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
    componentDidMount() {
        this.calcSize();
        this.loadPic();
        this.props.el.addEventListener('click', this.close);
        window.addEventListener('scroll', this.close);
        window.addEventListener('mousewheel', this.close);
    }

    loadPic = () => {
        let image = new Image();
        image.src = this.props.imageOri;
        if (image.complete === false) {
            image.onload = this.loadPicOver;
        } else {
            this.setState({
                loading: false,
                loadOver:true
            });
            this.scaleShow();
        }
    };
    loadPicOver = () => {
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
        const _nw = h * scale > w ? w : parseInt(h * scale);
        const _nh = parseInt(_nw / scale);
        const maxSize = {
            w: _nw,
            h: _nh,
            x: (w - _nw) / 2 + bounding.x,
            y: (h - _nh) / 2 + bounding.y
        };

        if (imageSize.w <= w && imageSize.h <= h) {
            this.setState({ picInit: imageSize, maxSize });
        } else {
            this.setState({ picInit: maxSize, maxSize });
        }
    };
    close = e => {
        if (e)  e.preventDefault();
        if (this.t) return false;
        this.scaleOut();
        this.t = setTimeout(() => {
            window.removeEventListener('mousewheel', this.close);
            const el = this.props.el;
            el.removeEventListener('click', el);
            document.getElementsByTagName('body')[0].removeChild(el);
        }, 500);
        return false;
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
    el: PropTypes.object.isRequired
};
PicViewerInner.defaultProps = {
    visible: true
};

export default PicViewer;