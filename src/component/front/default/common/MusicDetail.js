/**
 * Created by xiao on 2018/2/14.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import './musicDetail.css';
import { getWindowScrollY } from '../../../../tool/dom-js';
import { store } from '../../../../tool/store';
import DragHelper from '../../../../component/common/tool/DragHelper';
import http from '../../../../tool/http';

const showTopTip = (text, duration) => {
    const musicDetail = document.getElementsByClassName('music-detail')[0];
    if (!musicDetail) return;
    const container = document.createElement('div');
    musicDetail.appendChild(container);
    const remove = () => musicDetail.removeChild(container);
    ReactDOM.render(<TopTip text={text} duration={duration} remove={remove}/> ,container);
};
class TopTip extends Component {
    static propTypes = {
        text: PropTypes.string,
        duration: PropTypes.number,
        remove: PropTypes.func
    };
    static defaultProps = {
        duration: 2000
    };
    state = {
        hide: false
    };
    componentDidMount(){
        const { duration } = this.props;
        this.timer = setTimeout(() => {
            this.setState({ hide: true });
            if (this.props.remove) this.props.remove();
        }, duration);
    }
    componentWillUnmount(){
        clearTimeout(this.timer);
    }
    render() {
        return(
            <div className={!this.state.hide ? 'top-tip show' : 'top-tip'}>
                <span>{this.props.text}</span>
            </div>
        );
    }
}

class VolumeControl extends Component {
    constructor(props) {
        super(props);
        this.DragHelper = new DragHelper({
            onDragStart: this.onDragStart,
            onDragMove: this.onDragMove,
            onDragEnd: this.onDragEnd
        });
    }
    btnW = 14;
    state = {
        btnX: - Math.ceil(this.btnW / 2),
        percent: 100
    };
    static propTypes = {
        onChangeVolume: PropTypes.func,
        percent: PropTypes.number
    };
    static defaultPropTypes = {
        percent: 100
    };
    componentDidMount() {
        let percent = this.props.percent;
        percent = percent < 0 ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        percent = Math.ceil(percent);
        this.setState({
            btnX: this.percent2BtnX(percent),
            percent
        });
    }
    onDragStart = () => {};
    onDragEnd = () => {};
    onDragMove = ({ x, y, w, h }) => {
        const processW = this.refs.volume_bar_wrap.offsetWidth;
        x = x >= - Math.ceil(w / 2) ? x : - Math.ceil(w / 2);
        if (x > processW - Math.ceil(w / 2) ) x = processW - Math.ceil(w / 2);


        let _c = (x + w / 2) / processW;
        _c = _c > 0 ? _c : 0;
        _c = _c < 1 ? _c : 1;

        this.setState({
            btnX: x,
            percent: Math.ceil(_c * 100)
        });

        if (this.props.onChangeVolume) this.props.onChangeVolume(_c.toFixed(2));
    };
    percent2BtnX = percent => {
        const processW = this.refs.volume_bar_wrap.offsetWidth;
        let w = this.btnW;
        let x = Math.ceil(processW * percent / 100) - Math.ceil(w / 2);
        x = x >= - Math.ceil(w / 2) ? x : - Math.ceil(w / 2);
        if (x > processW - Math.ceil(w / 2) ) x = processW - Math.ceil(w / 2);
        return x;
    };
    shouldComponentUpdate(nextProps, nextState) {
        return (nextState.btnX != this.state.btnX || nextState.percent != this.state.percent);
    }
    render() {
        const { btnX, percent } = this.state;
        const btnStyle = {
            left: btnX
        };
        let barInnerStyle = {
            width: btnX + Math.ceil(this.btnW / 2)
        };
        return(
            <div className="music-volume-control">
                <span className="volume-title">音量</span>
                <div ref="volume_bar_wrap" className="volume-bar-wrap">
                    <div ref="volume_bar_btn" className="volume-bar-btn" style={btnStyle} {...this.DragHelper.props} />
                    <div className="volume-bar-inner" style={barInnerStyle}/>
                </div>
                <span className="volume-percent">{percent}%</span>
            </div>
        );
    }
}

class MusicDetail extends Component {
    static propTypes = {
        close: PropTypes.func,
        visible: PropTypes.bool,
        onChangeMusic: PropTypes.func,
        onPlay: PropTypes.func,
        onPause: PropTypes.func,
        show: PropTypes.bool
    };
    btnW = 17;
    state = {
        coverHeight: 0,
        summaryTop: '',
        summaryMini: true,
        marginTop: 0,
        init: false,
        coverScrollView: 'cover',
        currentLrcIndex: -1,
        lrcList: [],
        player: {
            loading: false,
            canPlay: false,
            touchStart: {},
            listBoxVisible: false,
            paused: true,
            btnX: - Math.ceil(this.btnW / 2),
            currentTime: 0,
            duration: -1,
            mode: 0, // 0:列表循环 1:随机播放 2:单曲循环,
            nowMusic: 0, //当前音乐id
            list: [],
            errorCount: 0, //失败次数
            maxErrorCount: 5,  //最大失败次数，超过后不再重试,
            adminMode: false
        }
    };
    componentDidMount(){
        this.resizeCover();
        window.addEventListener('resize', this.onResize);
        this.DragHelper = new DragHelper({
            onDragStart: this.onDragStart,
            onDragMove: this.onDragMove,
            onDragEnd: this.onDragEnd
        });
        this.DragHelper2 = new DragHelper({
            onDragStart: this.onDragCoverStart,
            onDragMove: this.onDragCoverMove,
            onDragEnd: this.onDragCoverEnd,
        });
       this.setMusicInfo(this.props);
        if (this.props.show) this.addEventListener();
    }

    //根据props中重置music
    setMusicInfo = props => {
        const { _music } = props;
        //播放列表为空才更新
        if (_music && _music.list.length > 0 && this.state.player.list.length == 0) {
            const player = { ...this.state.player };
            let nowMusic = _music.defaultMusic === undefined ? _music.list[0].id : _music.defaultMusic;
            nowMusic = this.findMusicById(nowMusic, _music.list) ? nowMusic : _music.list[0].id;
            player.mode = _music.mode;
            player.nowMusic = nowMusic;
            player.list = _music.list;
            player.adminMode = _music.adminMode;
            this.setState({ player });
            setTimeout(() => this.callChangeMusic(player.nowMusic));
        }
    };
    resizeCover = () => {
        const w = window.document.body.offsetWidth > 1400 ? 400 : window.document.body.offsetWidth * .65 + 100;
        const otherHeight = 75 + 35;
        this.setState({
            coverHeight: w < window.innerHeight - otherHeight ? w : window.innerHeight - otherHeight,
            summaryTop: w < window.innerHeight - otherHeight ? w : window.innerHeight - otherHeight
        });
    };
    onResize = () => {
       this.resizeCover();
    };
    addEventListener = () => {
        const { init } = this.state;
        if (init) return;
        const audio = this.refs.audio;
        audio.addEventListener('pause', this.onPause);
        audio.addEventListener('play', this.onPlay);
        audio.addEventListener('playing', this.onPlaying);
        audio.addEventListener('timeupdate', this.onTimeupdate);
        audio.addEventListener('ended', this.onEnded);
        audio.addEventListener('loadstart', this.onLoadstart);
        audio.addEventListener('canplay', this.onCanplay);
        audio.addEventListener('durationchange', this.onDurationchange);
        audio.addEventListener('canplaythrough', this.onCanplaythrough);
        audio.addEventListener('error', this.onError);
        audio.volume = .5;
        this.canModifyVolume = audio.volume == .5;
        this.setState({ init: true });
    };
    removeEventListener = () => {
        const { init } = this.state;
        if (!init) return;
        const audio = this.refs.audio;
        audio.removeEventListener('canplay', this.onCanplay);
        audio.removeEventListener('pause', this.onPause);
        audio.removeEventListener('play', this.onPlay);
        audio.removeEventListener('playing', this.onPlaying);
        audio.removeEventListener('timeupdate', this.onTimeupdate);
        audio.removeEventListener('ended', this.onEnded);
        audio.removeEventListener('loadstart', this.onLoadstart);
        audio.removeEventListener('durationchange', this.onDurationchange);
        audio.removeEventListener('canplaythrough', this.onCanplaythrough);
        audio.removeEventListener('error', this.onError);
        this.setState({ init: false });
    };
    componentWillReceiveProps(nextProps){
        this.setMusicInfo(nextProps);
        if (this.props.visible && !nextProps.visible) {
            this.back(false);
        }
        if (!this.props.visible && nextProps.visible) {
            if (this.state.init) this.refs.music_detail.className = 'music-detail animated-fast slideInRight';
            const mainWrap = document.getElementsByClassName('main-wrap')[0];
            const marginTop = - getWindowScrollY();
            this.setState({ marginTop:  marginTop });
            mainWrap.style.marginTop = marginTop + 'px';
            mainWrap.style.position = 'fixed';
        }
        if((nextProps.history.action == 'PUSH' || nextProps.history.action == 'POP')
            && nextProps.match.url!==this.props.match.url && this.props.visible){
            this.back();
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(!prevProps.visible && this.refs.music_detail) {
            if (this.state.player.list.length == 0) showTopTip('暂无音乐');
        }
        if(this.refs.audio) {
            this.addEventListener();
        }
        if(prevProps.visible && !this.props.visible){
            window.scrollTo(0, - this.state.marginTop);
        }
    }
    onLoadstart = e => {
        const player = { ...this.state.player };
        player.loading = true;
        player.canPlay = false;
        player.currentTime = 0;
        player.duration = -1; //显示'--:--'
        player.btnX = this.currentTime2btnX(0);
        this.setState({
            player,
            currentLrcIndex: -1,
            lrcList: []
        });
        this.loadLrcList();
    };
    loadLrcList = () => {
        const music = this.findMusic();
        if (!music || !music.lrc) return;
        const _array = music.lrc.split('\n');
        let lrcList = [];
        for (let i = 0; i < _array.length; i++) {
            let match = _array[i].match(/\[\d+:\d{2}\.\d+\]/g);
            if (match) {
                let lrcTime;
                //精确到毫秒
                let sss = match[0].match(/\d+/g);
                let m = parseInt(sss[0]);  //分
                let s = parseInt(sss[1]);  //秒
                let ms = parseInt(sss[2]); //毫秒
                lrcTime = m * 60 + s + parseFloat('0.' + ms);
                lrcList.push({
                    lrcTime,
                    lrcText: _array[i].replace(/\[\d+:\d{2}\.\d+\]/g, '')
                });
            }
        }
        this.setState({ lrcList });
    };
    findLrcIndex = currentTime => {
        const { lrcList } = this.state;
        if (lrcList.length == 0) return;
        const $lrcList = this.refs.lrcList;
        const lastNode = $lrcList.childNodes[lrcList.length - 1];
        const maxOffsetY = - lastNode.offsetTop - lastNode.offsetHeight + $lrcList.offsetHeight;
        const coverHeight = this.refs.cover.offsetHeight;
        for (let i = lrcList.length - 1; i >= 0; i--) {
            if (lrcList[i].lrcTime < currentTime) {
                //设置当前歌词
                const node = $lrcList.childNodes[i];
                node.className = 'now';
                //跳到歌词 歌词列表最大向上偏移 offsetHeight
                let top = coverHeight / 2 - node.offsetTop;
                top = top < 0 ? top : 0;
                top = top > maxOffsetY ? top : maxOffsetY;
                $lrcList.style.transform = `translate3d(0,${top}px,0)`;
                this.setState({ currentLrcIndex: i });
                return;
            }
        }
        $lrcList.style.transform = '';
        this.setState({ currentLrcIndex: -1 });

    };
    onError = e => {
        const player = { ...this.state.player };
        //失败最大此时不再重试
        if (player.errorCount >= player.maxErrorCount) {
            return;
        }
        player.errorCount ++ ;
        this.setState({ player });
        const audio = this.refs.audio;
        //2:单曲循环
        if (player.list.length == 1 || player.mode == 2) {
            setTimeout(() => audio.load(), 3000);
        } else {
            setTimeout(this.nextMusic, 3000);
        }
    };
    onCanplaythrough = e => {
        const player = { ...this.state.player };
        player.loading = false;
        this.setState({ player });
    };
    onDurationchange = e => {
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        player.duration = audio.duration;
        this.setState({ player });
    };
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
        if (player.mode == 2 || num == 1) {
            this.process2bar(0);
            audio.play();
        } else {
            this.nextMusic();
        }
    };
    //播放位置改变
    onTimeupdate = e => {
        if (this._dragStart) return;
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        player.currentTime = audio.currentTime;
        this.setState({ player });
        this.findLrcIndex(audio.currentTime);
        this.process2bar(audio.currentTime);
    };
    sec2time = second => {
        if (second == -1) return '--:--';
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
        player.canPlay = true;
        player.errCount = 0;
        this.setState({ player });
        const audio = this.refs.audio;
        audio.play();
    };
    onPlay = e => {
        const player = { ...this.state.player };
        player.paused = false;
        player.errCount = 0;
        const audio = this.refs.audio;
        player.duration = audio.duration;
        this.setState({ player });
        if (this.props.onPlay) this.props.onPlay();
    };
    //已开始播放
    onPlaying = e => {
        const player = { ...this.state.player };
        player.paused = false;
        player.errCount = 0;
        this.setState({ player });
        if (this.props.onPlay) this.props.onPlay();
    };
    componentWillUnmount(){
        clearTimeout(this.t);
        clearTimeout(this.backTimer);
        this.removeEventListener();
        window.removeEventListener('resize', this.onResize);
    }
    callChangeMusic = music_id => {
        if (this.refs.lrcList) this.refs.lrcList.style.transform = `translate3d(0,0,0)`;
        if (this.props.onChangeMusic) {
            const ret = this.findMusicById(music_id);
            this.props.onChangeMusic(ret && ret.music.cover);
        }
    };
    bar2process = btnX => {
        const currentTime = this.btnX2CurrentTime(btnX);
        const audio = this.refs.audio;
        audio.currentTime = currentTime;
        audio.play();
    };
    btnX2CurrentTime = btnX => {
        const player = { ...this.state.player };
        const barWidth = this.refs.process_bar.offsetWidth;
        const w = this.refs.process_btn.offsetWidth;
        let _c = (btnX + w / 2) * player.duration / barWidth;
        _c = _c > 0 ? _c : 0;
        const _max = player.duration > parseInt(player.duration) ? parseInt(player.duration) : player.duration - .1;
        return _c < player.duration ? _c : _max;
    };
    currentTime2btnX = currentTime => {
        const player = { ...this.state.player };
        const barWidth = this.refs.process_bar.offsetWidth;
        const w = this.refs.process_btn.offsetWidth;
        return player.duration > 0 ? barWidth * currentTime / player.duration - w / 2 : - Math.ceil(w / 2);
    };
    process2bar = currentTime => {
        const player = { ...this.state.player };
        player.btnX = this.currentTime2btnX(currentTime);
        this.setState({ player });
    };
    onDragStart = () => {
        this._dragStart = true;
    };
    onDragEnd = () => {
        this._dragStart = false;
        let player  = { ...this.state.player };
        this.bar2process(player.btnX);
    };
    onDragMove = ({ x, y, w, h }) => {
        let player  = { ...this.state.player };
        if (player.duration == 0) return;
        const processW = this.refs.process_bar.offsetWidth;
        x = x >= - Math.ceil(w / 2) ? x : - Math.ceil(w / 2);
        if (x > processW - Math.ceil(w / 2) ) x = processW - Math.ceil(w / 2);
        player.btnX = x;
        player.currentTime = this.btnX2CurrentTime(x);
        this.setState({
            player
        });
    };
    beforeMusic = () => {
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        const num = player.list.length;
        if (num == 1) return;

        let audioIndex = this.findMusicIndex();
        audioIndex = audioIndex - 1 >=0 ? audioIndex - 1 : num - 1;
        const newMusic = player.list[audioIndex];

        player.nowMusic = newMusic.id;
        audio.src = newMusic.src;
        audio.autoplay = true;
        this.callChangeMusic(newMusic.id);
        this.setState({ player });
    };
    nextMusic = () => {
        //判断播放模式
        const player = { ...this.state.player };
        const audio = this.refs.audio;
        const num = player.list.length;
        if (num == 1) return;

        let audioIndex = this.findMusicIndex();
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

        const newMusic = player.list[audioIndex];
        player.nowMusic = newMusic.id;
        audio.src = newMusic.src;
        audio.autoplay = true;
        this.callChangeMusic(newMusic.id);
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
        const emptyMusic = player.list.length == 0;
        if (emptyMusic) return showTopTip('暂无音乐');
        switch (name) {
            case 'mode':
                player.mode  = player.mode + 1 <= 2 ? player.mode + 1 : 0;
                this.setState({ player });
                let modeName;
                if (player.mode == 0) modeName = '列表循环';
                if (player.mode == 1) modeName = '随机播放';
                if (player.mode == 2) modeName = '单曲循环';
                showTopTip(modeName);
                if (player.adminMode) {
                    //管理员修改同时保存播放模式
                    http.apiPost('/admin/music/mode', { mode: player.mode });
                }
                break;
            case 'before':
                this.beforeMusic();
                break;
            case 'play':
                if (!player.loading && player.canPlay) audio.play();
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
    //关闭
    back = (callClose = true) => {
        this.refs.music_detail.className = 'music-detail animated-fast slideOutRight';
        const mainWrap = document.getElementsByClassName('main-wrap')[0];
        mainWrap.style.marginTop = '';
        mainWrap.style.position = '';
        if (callClose && this.props.onClose) this.props.onClose()
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
    musicItemOnClick = music_id => {
        let player = { ...this.state.player };
        if (player.nowMusic == music_id) return;

        //未找到指定音乐
        const ret = this.findMusicById(music_id);
        if (!ret) return;
        const newMusic = ret.music;

        player.nowMusic = music_id;
        const audio = this.refs.audio;
        audio.src = newMusic.src;
        audio.autoplay = true;
        this.callChangeMusic(music_id);
            this.setState({ player });
    };
    toggleSummary = () => {
        this.setState({ summaryMini: !this.state.summaryMini });
    };

    //根据音乐id从音乐列表中返回音乐信息，失败返回false index索引
    findMusicById = (id, musicList = false) => {
        const _list = musicList ? musicList : this.state.player.list;
        let music = false;
        let i = 0;
        for (; i< _list.length; i++) {
            if (_list[i].id == id) {
                music = { ..._list[i] };
                break;
            }
        }
        return music ? { index: i, music } : false;
    };
    //获取当前音乐索引
    findMusicIndex = () => {
        const ret = this.findMusicById(this.state.player.nowMusic);
        return ret ? ret.index : 0;
    };
    //获取当前音乐信息
    findMusic = () => {
        const ret = this.findMusicById(this.state.player.nowMusic);
        return ret && ret.music;
    };
    deleteMusic = async deleteMusicId => {
        //管理员组才能删除
        let player = { ...this.state.player };
        const audio = this.refs.audio;
        if (!this.findMusicById(deleteMusicId)) return;
        const data = {
            id: deleteMusicId
        };

        let res = await http.apiPost('/admin/music/delete', data);
        if (res.code == -1) return;

        //删除的是当前播放暂停当前音乐，重置播放进度
        if (deleteMusicId == player.nowMusic) {
            audio.pause();
            audio.src = '';
            this.process2bar(0);
        }

        //删除成功，重新获取音乐列表
        res = await http.apiGet('/music/list');
        if (res.code == -1) return;

        const newMusicList  = res.data.list;
        player.list = newMusicList;
        //重新获取当前播放音乐索引
        let ret = this.findMusicById(deleteMusicId, newMusicList);
        let audioIndex = 0;
        if (ret) audioIndex = ret.index;
        if (newMusicList.length < audioIndex + 1 ) audioIndex = 0;

        player.audioIndex = audioIndex;
        //删除的是当前播放的才需要重新开始下一首
        if (deleteMusicId == player.nowMusic) {
            const newMusic = newMusicList[audioIndex];
            audio.src = newMusic.src;
            audio.autoplay = true;
            this.callChangeMusic(newMusic.id);
        }
        this.setState({ player });

    };
    onDragCoverStart = () => {
        const $cover = this.refs.cover;
        $cover['data-start'] = Date.now();
    };
    onDragCoverMove = ({ x, y, w, h }) => {
        const $cover = this.refs.cover;
        const $coverStyle = $cover.style;
        x = x + (!isNaN($cover['data-x']) ? $cover['data-x'] : 0);
        if (x > 0) x = '0';
        if (x < - w / 2) x = - w / 2;
        $coverStyle.transform = `translate3d(${x}px,0,0)`;
    };
    onDragCoverEnd = ({ x, y, w, h }) => {
        const $cover = this.refs.cover;
        const start = $cover['data-start'] > 0 ? $cover['data-start'] : 0;
        const now = Date.now();
        if (now - start <= 500 && x) {
            if (x < -10) return this.change2Lrc();
            if (x > 10) return this.change2Cover();
        }
        x = x + (!isNaN($cover['data-x']) ? $cover['data-x'] : 0);
        if (x < - w / 4) {
            this.change2Lrc();
        } else {
            this.change2Cover();
        }
    };
    //切换到封面
    change2Cover = () => {
        const $cover = this.refs.cover;
        $cover['data-x'] = 0;
        const $coverStyle = $cover.style;
        $coverStyle.transition = 'transform ease .3s';
        $coverStyle.transform = '';
        this.setState({ coverScrollView: 'cover' });
        clearTimeout(this.scrollViewTimer);
        this.scrollViewTimer = setTimeout(() => $coverStyle.transition = '', 300)
    };
    //切换到歌词
    change2Lrc = () => {
        const $cover = this.refs.cover;
        $cover['data-x'] = - $cover.offsetWidth / 2;
        const $coverStyle = this.refs.cover.style;
        $coverStyle.transition = 'transform ease .3s';
        $coverStyle.transform = 'translate3d(-50%,0,0)';
        this.setState({ coverScrollView: 'lrc' });
        clearTimeout(this.scrollViewTimer);
        this.scrollViewTimer = setTimeout(() => $coverStyle.transition = '', 300)
    };
    //调节音量
    changeVolume = _c => {
        const audio = this.refs.audio;
        audio.volume = _c;
    };
    render() {
        const { player, coverHeight, summaryMini, summaryTop, coverScrollView,
            lrcList, currentLrcIndex } = this.state;
        const operOnClick = this.operOnClick;
        let precessBtnStyle = {
            left: player.btnX
        };
        let precessInnerStyle = {
            width: player.btnX + Math.ceil(this.btnW / 2)
        };
        const audioInfo = this.findMusic();
        let cover, author, caption, audioSrc;
        if (audioInfo) {
            cover = audioInfo.cover;
            author = audioInfo.author;
            caption = audioInfo.caption;
            audioSrc = audioInfo.src;
        }
        const style = {
            backgroundImage: cover ? `url(${cover})` : '',
                backgroundPosition: 'center center'
        };
        let listBoxItem = [];
        if (player.listBoxVisible) {
            listBoxItem = player.list.map((val, index) => {
                const deleteOnClick = e => {
                    e.stopPropagation(); //阻止冒泡
                    this.deleteMusic(val.id);
                };
                return (
                    <div className={val.id == player.nowMusic ? 'list-item playing' : 'list-item'} onClick={() => this.musicItemOnClick(val.id)} key={index}>
                        <span className="music-caption">{val.caption}</span>
                        <span className="music-author">-{val.author}</span>
                        {player.adminMode && <span className="music-delete" onClick={deleteOnClick}>╳</span>}
                    </div>
                );
            });
        }

        if (!this.props.show) return null;
        let modeName = '';
        if (player.mode == 0) modeName = '列表循环';
        if (player.mode == 1) modeName = '随机播放';
        if (player.mode == 2) modeName = '单曲循环';

        const lrcListItems = lrcList.length > 0 ?
            lrcList.map((val, index) => {
                return <p className={index == currentLrcIndex ? 'now' : ''} key={index}>{val.lrcText}</p>;
            }):
            <p>无歌词</p>;
        return (
            <div ref="music_detail" className="music-detail animated-fast slideInRight">
                <div className="music-cover" style={{ height: coverHeight }}>
                    <div className="info-blurbg-wrapper">
                        <div className="info-blurbg" style={style}/>
                    </div>
                    <div className="cover-info">
                        <div className="caption">{caption}<span onClick={this.back} className="back-btn" /></div>
                        <div ref="cover" className="cover-scroll-view"
                             {...this.DragHelper2.props}>
                            <div className="cover-img">
                                {cover && <img src={cover}/>}
                            </div>
                            <div ref="lrcList" className="lrc-list">
                                {lrcListItems}
                            </div>
                        </div>
                        <div className="scroll-view-btns">
                            <span className={coverScrollView === 'cover' ? 'now-scroll' : ''} onClick={this.change2Cover}/>
                            <span className={coverScrollView === 'lrc' ? 'now-scroll' : ''} onClick={this.change2Lrc} />
                        </div>
                    </div>
                </div>
                <div ref="music_summary" className={summaryMini ? 'music-summary' : 'music-summary all'} style={summaryMini ? { top: summaryTop } : null}>
                    <div className="summary-tab" onClick={this.toggleSummary}>
                        <span>简介</span>
                    </div>
                    <div className="summary-inner">
                        <p className="caption">{caption}</p>
                        <span className="other-info">歌手：{author}</span>
                    </div>
                </div>
                <div className="music-oper">
                    <audio ref="audio" src={audioSrc} controls={false} autoPlay={true} />
                    <div className="music-process-wrap">
                        <div className="process-timer">{this.sec2time(player.currentTime)}</div>
                        <div ref="process_bar" className="process-bar">
                            <div ref="process_btn" className="process-btn-wrap" {...this.DragHelper.props} style={precessBtnStyle}>
                                <div className={player.loading ? 'process-btn-loading' : 'process-btn'}/>
                            </div>
                            <div className="process-inner" style={precessInnerStyle}/>
                            <div className="process-bg"/>
                        </div>
                        <div className="process-timer">{this.sec2time(player.duration)}</div>
                    </div>
                    <div className="music-btns">
                        <div className="btn-wrap">
                            {player.mode == 0 && <span className="btn mode0" onClick={() => operOnClick('mode')}/>}
                            {player.mode == 1 && <span className="btn mode1" onClick={() => operOnClick('mode')}/>}
                            {player.mode == 2 && <span className="btn mode2" onClick={() => operOnClick('mode')}/>}
                        </div>
                        <div className="btn-wrap">
                            <span className="btn before" onClick={() => operOnClick('before')}/>
                        </div>
                        <div ref="play_pause" className="btn-wrap">
                            {player.paused ?
                                <span className="btn play" onClick={() => operOnClick('play')}/> :
                                <span className="btn pause" onClick={() => operOnClick('pause')}/>}
                        </div>
                        <div className="btn-wrap">
                            <span className="btn next" onClick={() => operOnClick('next')}/>
                        </div>
                        <div className="btn-wrap">
                            <span className="btn list" onClick={() => operOnClick('list')}/>
                        </div>
                    </div>
                </div>
                { player.listBoxVisible &&
                <div className="music-list-box">
                    <div className="music-list-box-mask" onClick={this.closeListBox}/>
                    <div className="music-list-box-wrap">
                        <div className="music-box-top">
                            <span>{modeName}</span>
                            {this.canModifyVolume && <VolumeControl onChangeVolume={this.changeVolume} percent={this.refs.audio.volume * 100}/>}
                        </div>
                        <div className="music-list">
                            {listBoxItem}
                        </div>
                        <div className="btn-group">
                            <span onClick={this.closeListBox}>关闭</span>
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}

const map = (state) => ({ _music: state._music });

export default store(withRouter(MusicDetail), map);