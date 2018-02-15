/**
 * Created by xiao on 2018/2/14.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './music.css';
import { maxWidthPoint } from '../../../../enum';
import MusicDetail from './MusicDetail';
import DragHelper from '../../../../component/common/tool/DragHepler';

class MusicWedgit extends Component {
    constructor() {
        super();
        this.DragHelper = new DragHelper(this.onDragMove);
    }
    state = {
        showInit: false,
        x: false,
        y: false,
        showMusicDetail: false,
        musicCover: '',
        pause: true
    };
    onDragMove = ({ x, y, w, h }) => {
        let windowWidth = window.document.body.offsetWidth;
        let windowHeight =  window.innerHeight;
        const borderWidth = 5;
        x = x >= borderWidth ? x : borderWidth;
        y = y >= 44 + borderWidth ? y: 44 + borderWidth;
        if (x + w > windowWidth + borderWidth) x = windowWidth - borderWidth - w;
        if (y + h > windowHeight + borderWidth) y = windowHeight -borderWidth - h;
        this.setState({
            x, y
        });
    };
    showMusicDetail = () => {
        if (this.DragHelper.dragging > 0) return;
        this.setState({ showInit: true, showMusicDetail: true });
    };
    maskClick = () => {
        this.refs.mask.style.pointerEvents = 'none';
        this.closeMusicDetail();
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
        const { showInit, x, y, showMusicDetail, musicCover, pause } = this.state;
        let style = {
            zIndex: showMusicDetail ? -1 : 9
        };
        if (x && y) style = { left: x, top: y, ...style };
        let musicWedgitCls = showMusicDetail ? 'animated-fast fadeOutLeft' : 'animated-fast fadeInLeft';
        if (!pause) musicWedgitCls = musicWedgitCls + ' music_playing';
        return (
            <div id="lolili_music">
                {showMusicDetail && <div ref="mask" className="mask" onClick={this.maskClick} />}
                <MusicDetail visible={showMusicDetail} show={showInit} onChangeMusic={this.onChangeMusic} onClose={this.closeMusicDetail} onPlay={this.onPlay} onPause={this.onPause}/>
                <div id="music_wedgit" className={musicWedgitCls} style={style} onClick={this.showMusicDetail}
                     {...this.DragHelper.props}>
                    {musicCover !='' && <img src={musicCover}/> }
                </div>
            </div>
        );
    }
}

export default MusicWedgit;