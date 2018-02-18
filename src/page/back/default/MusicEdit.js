/**
 * Created by xiao on 2018/2/15.
 */
import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import http from '../../../tool/http';
import Spin from '../../../component/common/tool/Spin';
import './musicEdit.css';

const FormInput = props => {
    return <input className="admin-form-input" type="text" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class MusicEdit extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            music: {
                caption: '',
                cover: '',
                src: '',
                author: ''
            },
            net_music_analysis: false,
            net_music_id: ''
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.music){
            let music = {...this.state.music};
            music[name] = value;
            this.setState({ music });
        }
        if(name == 'net_music_id') {
            this.setState({ [name]: value });
        }
    };
    addMusic = async () => {
        if(this.state.loading) return;
        const { cover, author, caption, src } = this.state.music;
        if (cover.length == 0){
            alert('请输入封面地址!');
            return;
        }
        if (author.length == 0){
            alert('请输入歌手!');
            return;
        }
        if (caption.length == 0){
            alert('请输入歌名!');
            return;
        }
        if (src.length == 0){
            alert('请输入音乐地址!');
            return;
        }

        //id小于0约定为添加音乐
        const data = {
            id: -1,
            music: {
                cover, author, caption, src
            }
        };

        this.setState({ loading: true });
        const res = await http.apiPost('/admin/music/edit', data);
        this.setState({
            loading: false
        });

        if(res.code == 0){
            alert('添加成功~');
            return this.props.history.push('/admin/music/list');
        }else{
            alert(res.data);
        }

    };
    saveMusic = async () => {
        if(this.state.loading) return;
        const { cover, author, caption, src, id } = this.state.music;
        if(!id){
            alert('音乐数据出错,请刷新重试');
            return;
        }
        if (cover.length == 0){
            alert('请输入封面地址!');
            return;
        }
        if (author.length == 0){
            alert('请输入歌手!');
            return;
        }
        if (caption.length == 0){
            alert('请输入歌名!');
            return;
        }
        if (src.length == 0){
            alert('请输入音乐地址!');
            return;
        }

        //id小于0约定为添加音乐
        const data = {
            id,
            music: {
                cover, author, caption, src
            }
        };

        this.setState({ loading: true });
        const res = await http.apiPost('/admin/music/edit', data);
        this.setState({
            loading: false
        });

        if(res.code == 0){
            alert('保存成功~');
        }else{
            alert('服务器返回异常');
        }

    };
    //显示网易云音乐解析输入框
    showNetMusicAnalysis = () => {
        this.setState({
            net_music_analysis: true
        });
    };
    cancelNetMusicAnalysis = () => {
        this.setState({
            net_music_analysis: false
        });
    };
    netMusicAnalysis = async () => {
        const { net_music_id } = this.state;
        if (this.state.loading) return;
        if (net_music_id.length == 0) {
            alert('请输入网易云音乐id!');
            return;
        }
        if (isNaN(net_music_id)) {
            alert('请输入正确的网易云音乐id，只能为数字!');
            return;
        }
        const data = {
            net_music_id
        };
        const res = await http.apiPost('/admin/net-music', data);
        if (res.code == 0) {
            const _music = res.data;
            let music = {
                cover: _music.cover,
                src: _music.src,
                author: _music.author,
                caption: _music.caption
            };
            if (this.state.music.id) music.id = this.state.music.id;
            this.setState({ music });
            alert('解析成功~');
        } else {
            alert(res.data);
        }
    };
    render() {
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-music-edit"/></Spin>
        }

        const { caption, cover, author, src, id } = this.state.music;
        const { net_music_id, net_music_analysis } = this.state;
        const formInputOnChange = this.formInputOnChange;
        return (
            <div className="admin-music-edit slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>音乐编辑~~</h2>
                    {net_music_analysis ?
                        <div>
                            <h5>【网易云音乐ID】<a href="javascript:void(0);" onClick={this.netMusicAnalysis}>开始解析</a> <a href="javascript:void(0);" onClick={this.cancelNetMusicAnalysis}>取消</a></h5>
                            <FormInput name="net_music_id" value={net_music_id} onChange={formInputOnChange} />
                        </div>:
                        <div>
                            <h5>【网易云音乐解析】<a href="javascript:void(0);" onClick={this.showNetMusicAnalysis}>解析</a></h5>
                        </div>
                    }
                    <h5>【歌名】</h5>
                    <FormInput name="caption" value={caption} onChange={formInputOnChange} />
                    <h5>【歌手】</h5>
                    <FormInput name="author" value={author} onChange={formInputOnChange} />
                    <h5>【音乐地址】</h5>
                    <FormInput name="src" value={src} onChange={formInputOnChange} />
                    <h5>【封面】</h5>
                    <FormInput name="cover" value={cover} onChange={formInputOnChange} />
                    <img className="img-cover" src={cover}/>
                </div>
                <div className="admin-form-group text-right">
                    {id ? <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveMusic}>{this.state.loading ? '保存...': '保存'}</a> :
                        <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.addMusic}>{this.state.loading ? '添加...': '添加'}</a>}
                    <Link className="btn btn-cancel" to="/admin/music/list">取消</Link>
                </div>
            </div>
        );
    }
}

export default PageComponent.withStore(MusicEdit);