/**
 * Created by xiao on 2018/2/14.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './musicDetail.css';
import { getWindowScrollY } from '../../../../tool/dom-js';
import { store } from '../../../../tool/store';
import {maxWidthPoint} from "../../../../enum";

class MusicDetail extends Component {
    static propTypes = {
        close: PropTypes.func,
        visible: PropTypes.bool,
        onChangeMusic: PropTypes.func,
        onPlay: PropTypes.func,
        onPause: PropTypes.func,
        show: PropTypes.bool
    };
    state = {
        coverHeight: 0,
        summaryMini: true,
        marginTop: 0,
        init: false,
        player: {
            touchStart: {},
            listBoxVisible: false,
            paused: true,
            btnX: -8,
            currentTime: 0,
            duration: 0,
            mode: 0, // 0:列表循环 1:随机播放 2:单曲循环,
            audioIndex: 0,
            list: [],
        }
    };
    componentDidMount(){
        const { _music } = this.props;
        this.setState({
            coverHeight: window.document.body.offsetWidth,
        });
        if (_music) {
            const player = { ...this.state.player };
            player.mode = _music.mode;
            player.audioIndex = _music.audioIndex;
            player.list = _music.list;
            this.setState({ player });
            setTimeout(() => this.callChangeMusic(_music.audioIndex));
        }
        if (this.props.show) this.addEventLister();
    }
    addEventListener = () => {
        const { init } = this.state;
        if (init) return;
        const audio = this.refs.audio;
        audio.addEventListener('canplay', this.onCanplay());
        audio.addEventListener('pause', this.onPause);
        audio.addEventListener('play', this.onPlay);
        audio.addEventListener('playing', this.onPlaying);
        audio.addEventListener('timeupdate', this.onTimeupdate);
        audio.addEventListener('ended', this.onEnded);
        this.setState({ init: true });
    };
    removeEventListener = () => {
        const { init } = this.state;
        if (!init) return;
        const audio = this.refs.audio;
        audio.removeEventListener('canplay', this.onCanplay());
        audio.removeEventListener('pause', this.onPause);
        audio.removeEventListener('play', this.onPlay);
        audio.removeEventListener('playing', this.onPlaying);
        audio.removeEventListener('timeupdate', this.onTimeupdate);
        audio.removeEventListener('ended', this.onEnded);
        this.setState({ init: false });
    };
    componentWillReceiveProps(nextProps){
        if (!this.props.visible && nextProps.visible) {
            if (this.state.init) this.refs.music_detail.className = 'music-detail animated-fast slideInRight';
            const mainWrap = document.getElementsByClassName('main-wrap')[0];
            const marginTop = - getWindowScrollY();
            this.setState({ marginTop:  marginTop });
            mainWrap.style.marginTop = marginTop + 'px';
            mainWrap.style.position = 'fixed';
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(this.refs.audio) {
            this.addEventListener();
        }
        if(prevProps.visible && !this.props.visible){
            window.scrollTo(0, - this.state.marginTop);
        }
    }
    onPause = e => {
        const player = { ...this.state.player };
        player.paused = true;
        this.setState({ player });
        if (this.props.onPause) this.props.onPause();
    };
    //播放完毕
    onEnded = e => {
        //0:列表循环 1:随机播放 2:单曲循环
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        const num = player.list.length;
        if (num == 0) return;
        //0:列表循环 1:随机播放 2:单曲循环
        if (player.mode == 2) {
            audio.play();
        } else {
            this.nextMusic();
        }
    };
    //播放位置改变
    onTimeupdate = e => {
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        player.currentTime = audio.currentTime;
        this.setState({ player });
        this.process2bar(audio.currentTime);
    };
    sec2time = second => {
        let m, s;
        m = parseInt(second / 60);
        s = parseInt(second - m * 60);
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        return `${m}:${s}`;
    };
    //就绪
    onCanplay = e => {
        const player = { ...this.state.player };
        this.setState({ player });
    };
    onPlay = e => {
        const player = { ...this.state.player };
        player.paused = false;
        const audio = this.refs.audio;
        player.duration = audio.duration;
        this.setState({ player });
        if (this.props.onPlay) this.props.onPlay();
    };
    //已开始播放
    onPlaying = e => {
        const player = { ...this.state.player };
        player.paused = false;
        this.setState({ player });
        if (this.props.onPlay) this.props.onPlay();
    };
    componentWillUnmount(){
        clearTimeout(this.t);
        clearTimeout(this.backTimer);
        this.removeEventListener();
    }
    callChangeMusic = audioIndex => {
        if (this.props.onChangeMusic) {
            const music = this.state.player.list[audioIndex || this.state.player.audioIndex];
            this.props.onChangeMusic(music && music.cover);
        }
    };
    onTouchStart = e => {
        const touch = e.targetTouches[0];
        let player = { ...this.state.player };
        player.touchStart = {
            offsetX: touch.pageX - e.target.offsetLeft
        };
        this.setState({
            player
        });
    };
    onTouchMove = e => {
        let player  = { ...this.state.player };
        if (player.duration == 0) return;
        const { touchStart } = player;
        if (e.cancelable) {
            // 判断默认行为是否已经被禁用
            if (!e.defaultPrevented) {
                e.preventDefault();
            }
        }
        const touch = e.targetTouches[0];
        const w = e.target.offsetWidth;
        let x = touch.pageX - touchStart.offsetX;
        const processW = this.refs.process_bar.offsetWidth;
        x = x >= - parseInt(w / 2) ? x : - parseInt(w / 2);
        if (x > processW - w / 2 ) x = processW - w / 2;
        player.btnX = x;
        this.setState({
            player
        });
        this.bar2process(x);
    };
    bar2process = btnx => {
        const player = { ...this.state.player };
        const barWidth = this.refs.process_bar.offsetWidth;
        const w = this.refs.process_btn.offsetWidth;
        const currentTime = (btnx + w / 2) * player.duration / barWidth;
        const audio = this.refs.audio;
        audio.currentTime = currentTime;
    };
    process2bar = currentTime => {
        const player = { ...this.state.player };
        const barWidth = this.refs.process_bar.offsetWidth;
        const w = this.refs.process_btn.offsetWidth;
        player.btnX = player.duration > 0 ? barWidth * currentTime / player.duration - w / 2 : - w / 2;
        this.setState({ player });
    };
    beforeMusic = () => {
        const player = { ...this.state.player };
        let audioIndex = player.audioIndex;
        const audio = this.refs.audio;
        const num = player.list.length;
        if (num == 1) return;
        audioIndex = audioIndex - 1 >=0 ? audioIndex - 1 : num - 1;
        player.audioIndex = audioIndex;
        audio.src = player.list[audioIndex].src;
        audio.autoplay = true;
        this.callChangeMusic(audioIndex);
        this.setState({ player });
    };
    nextMusic = () => {
        //判断播放模式
        const player = { ...this.state.player };
        let audioIndex = player.audioIndex;
        const audio = this.refs.audio;
        const num = player.list.length;
        if (num == 1) return;
        //0:列表循环 1:随机播放 2:单曲循环
        if (player.mode == 0 || player.mode == 2) {
            audioIndex = audioIndex + 1 <= num - 1 ? audioIndex + 1 : 0;
        }
        else if (player.mode == 1) {
            let newAudioIndex = audioIndex;
            do {
                newAudioIndex = parseInt(Math.random() * num);
            } while(newAudioIndex == audioIndex);
            audioIndex = newAudioIndex;
        } else return;
        player.audioIndex = audioIndex;
        audio.src = player.list[audioIndex].src;
        audio.autoplay = true;
        this.callChangeMusic(audioIndex);
        this.setState({ player });
    };
    operOnClick = name => {
        clearTimeout(this.t);
        if (name == 'pause' || name == 'play') {
            this.refs.play_pause.className = 'btn-wrap lighting';
        }

        this.t = setTimeout(() => {
            if (name == 'pause' || name == 'play') {
                this.refs.play_pause.className = 'btn-wrap';
            }
        }, 250);
        const audio = this.refs.audio;
        const player = { ...this.state.player };
        switch (name) {
            case 'mode':
                player.mode  = player.mode + 1 <= 2 ? player.mode + 1 : 0;
                this.setState({ player });
                break;
            case 'before':
                this.beforeMusic();
                break;
            case 'play':
                audio.play();
                break;
            case 'pause':
                audio.pause();
                break;
            case 'next':
                this.nextMusic();
                break;
            case 'list':
                this.showListBox();
                break;
        }
    };
    back = () => {
        this.refs.music_detail.className = 'music-detail animated-fast slideOutRight';
        this.backTimer = setTimeout(() => {
            const mainWrap = document.getElementsByClassName('main-wrap')[0];
            mainWrap.style.marginTop = '';
            mainWrap.style.position = '';
            if (this.props.onClose) this.props.onClose();
        }, 500);
    };
    showListBox = () => {
        const player = { ...this.state.player };
        player.listBoxVisible = true;
        this.setState({ player });
    };
    closeListBox = () => {
        const player = { ...this.state.player };
        player.listBoxVisible = false;
        this.setState({ player });
    };
    musicItemOnClick = audioIndex => {
        const player = { ...this.state.player };
        if (player.audioIndex == audioIndex) return;
        player.audioIndex = audioIndex;
        const audio = this.refs.audio;
        audio.src = player.list[audioIndex].src;
        audio.autoplay = true;
        this.callChangeMusic(audioIndex);
        this.setState({ player });
    };
    toggleSummary = () => {
        this.setState({ summaryMini: !this.state.summaryMini });
    };
    render() {
        const { player, coverHeight, summaryMini } = this.state;
        const operOnClick = this.operOnClick;
        const precessBtnStyle = {
            left: player.btnX
        };
        const audioInfo = player.list[player.audioIndex];
        let cover, author, caption, audioSrc;
        if (audioInfo) {
            cover = audioInfo.cover;
            author = audioInfo.author;
            caption = audioInfo.caption;
            audioSrc = audioInfo.src;
        }
        const style = {
            backgroundImage: `url(${cover})`,
            backgroundPosition: 'center',
            backgroundSize: '200%'
        };
        let listBoxItem = [];
        if (player.listBoxVisible) {
            listBoxItem = player.list.map((val, index) => {
                return (
                    <div className={index == player.audioIndex ? 'list-item playing' : 'list-item'} onClick={() => this.musicItemOnClick(index)} key={index}>
                        <span className="music-caption">{val.caption}</span>
                        <span className="music-author">-{val.author}</span>
                    </div>
                );
            });
        }
        let musicDetailStyle = {
            display: 'none'
        };
        if (this.props.visible) {
            musicDetailStyle.display = 'block';
        }
        if (!this.props.show) return null;
        let modeName = '';
        if (player.mode == 0) modeName = '列表循环';
        if (player.mode == 1) modeName = '随机播放';
        if (player.mode == 2) modeName = '单曲循环';
        return (
            <div ref="music_detail" className="music-detail animated-fast slideInRight" style={musicDetailStyle}>
                <div className="music-cover" style={{ height: coverHeight }}>
                    <div className="info-blurbg-wrapper">
                        <div className="info-blurbg" style={style}/>
                    </div>
                    <div className="cover-info">
                        <div className="caption">{caption}<a onClick={this.back} className="back-btn" href="javascript:void(0);"/></div>
                        <div className="cover-img">
                            <img src={cover}/>
                        </div>
                    </div>
                </div>
                <div ref="music_summary" className={summaryMini ? 'music-summary' : 'music-summary all'}>
                    <div className="summary-tab" onClick={this.toggleSummary}>
                        <span>简介</span>
                    </div>
                    <div className="summary-inner">
                        <p className="caption">{caption}</p>
                        <span className="other-info">歌手：{author}</span>
                    </div>
                </div>
                <div className="music-oper">
                    <audio ref="audio" src={audioSrc} controls={false} autoPlay={true}/>
                    <div className="music-process-wrap">
                        <div className="process-timer">{this.sec2time(player.currentTime)}</div>
                        <div ref="process_bar" className="process-bar">
                            <div ref="process_btn" className="process-btn" style={precessBtnStyle}
                                 onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}/>
                            <div className="process-inner"/>
                            <div className="process-bg"/>
                        </div>
                        <div className="process-timer">{this.sec2time(player.duration)}</div>
                    </div>
                    <div className="music-btns">
                        <div className="btn-wrap">
                            {player.mode == 0 && <a className="btn mode0" href="javascript:void(0);" onClick={() => operOnClick('mode')}/>}
                            {player.mode == 1 && <a className="btn mode1" href="javascript:void(0);" onClick={() => operOnClick('mode')}/>}
                            {player.mode == 2 && <a className="btn mode2" href="javascript:void(0);" onClick={() => operOnClick('mode')}/>}
                        </div>
                        <div className="btn-wrap">
                            <a className="btn before" href="javascript:void(0);" onClick={() => operOnClick('before')}/>
                        </div>
                        <div ref="play_pause" className="btn-wrap">
                            {player.paused ?
                                <a className="btn play" href="javascript:void(0);" onClick={() => operOnClick('play')}/> :
                                <a className="btn pause" href="javascript:void(0);" onClick={() => operOnClick('pause')}/>}
                        </div>
                        <div className="btn-wrap">
                            <a className="btn next" href="javascript:void(0);" onClick={() => operOnClick('next')}/>
                        </div>
                        <div className="btn-wrap">
                            <a className="btn list" href="javascript:void(0);" onClick={() => operOnClick('list')}/>
                        </div>
                    </div>
                </div>
                { player.listBoxVisible &&
                <div className="music-list-box">
                    <div className="music-list-box-mask" onClick={this.closeListBox}/>
                    <div className="music-list-box-wrap">
                        <div className="music-box-top">
                            <span>{modeName}</span>
                        </div>
                        <div className="music-list">
                            {listBoxItem}
                        </div>
                        <div className="btn-group">
                            <a href="javascript:void(0);" onClick={this.closeListBox}>关闭</a>
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}

const map = (state) => ({ _music: state._music });

export default store(MusicDetail, map);