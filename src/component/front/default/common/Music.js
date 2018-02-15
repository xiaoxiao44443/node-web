/**
 * Created by xiao on 2018/2/14.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './music.css';
import { maxWidthPoint } from '../../../../enum';
import MusicDetail from './MusicDetail';

class MusicWedgit extends Component {
    state = {
        show: false,
        showInit: false,
        start: false,
        x: false,
        y: false,
        showMusicDetail: false,
        musicCover: '',
        pause: true
    };
    componentDidMount() {
        const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
        let show = maxWidth <= maxWidthPoint.small;
        this.setState({ show });
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    onResize = () => {
        const maxWidth = typeof window === 'undefined' ? false : window.document.body.offsetWidth;
        let show = maxWidth <= maxWidthPoint.small;
        this.setState({ show });
    };
    onTouchStart = e => {
        const touch = e.targetTouches[0];
        this.setState({
            start: {
                offsetX: touch.pageX - e.target.offsetLeft,
                offsetY: touch.pageY - e.target.offsetTop
            }
        });
    };
    onTouchMove = e => {
        const { start } = this.state;
        if (!start) return;
        if (e.cancelable) {
            // 判断默认行为是否已经被禁用
            if (!e.defaultPrevented) {
                e.preventDefault();
            }
        }
        const touch = e.targetTouches[0];
        const w = e.target.offsetWidth;
        const h = e.target.offsetHeight;
        let x = touch.pageX - start.offsetX;
        let y = touch.pageY - start.offsetY;
        let windowWidth = window.document.body.offsetWidth;
        let windowHeight =  window.screen.height;
        const borderWidth = 5;
        x = x >= borderWidth ? x : borderWidth;
        y = y >= 44 + borderWidth ? y: 44 + borderWidth;
        if (x + w > windowWidth + borderWidth) x = windowWidth - borderWidth - w;
        if (y + h > windowHeight + borderWidth) y = windowHeight -borderWidth - h;
        this.setState({
            x, y
        });
    };
    onTouchEnd = e => {
        this.setState({
            start: false
        });
    };
    showMusicDetail = () => {
        this.setState({ showInit: true, showMusicDetail: true });
    };
    closeMusicDetail = () => {
        this.setState({ showMusicDetail: false });
    };
    onChangeMusic = cover => {
        this.setState({ musicCover: cover });
    };
    onPlay = () => {
        this.setState({ pause: false });
    };
    onPause = () => {
        this.setState({ pause: true });
    };
    render() {
        const { show, showInit, x, y, showMusicDetail, musicCover, pause } = this.state;
        if (!show) return null;
        let style = {
            zIndex: showMusicDetail ? -1 : 9
        };
        if (x && y) style = { left: x, top: y, ...style };
        return (
            <div id="lolili_music">
                <MusicDetail visible={showMusicDetail} show={showInit} onChangeMusic={this.onChangeMusic} onClose={this.closeMusicDetail} onPlay={this.onPlay} onPause={this.onPause}/>
                <div id="music_wedgit" className={!pause ? 'music_playing' : false} style={style} onClick={this.showMusicDetail} onTouchStart={this.onTouchStart}
                     onTouchMove={this.onTouchMove} onTouchEnd={this.onTouchEnd}>
                    {musicCover !='' && <img src={musicCover}/> }
                </div>
            </div>
        );
    }
}

export default MusicWedgit;