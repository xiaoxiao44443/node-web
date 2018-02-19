/**
 * Created by xiao on 2018/2/15.
 */
import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import http from '../../../tool/http';
import './musicList.css';
import moment from 'moment';
import Spin from '../../../component/common/tool/Spin';

class MusicItem extends Component {
    static propTypes = {
        id: PropTypes.number,
        caption: PropTypes.string,
        author: PropTypes.string,
        cover: PropTypes.string,
        src: PropTypes.string,
        index: PropTypes.number,
        create_time: PropTypes.number,
        isDefault: PropTypes.bool
    };
    render() {
        let { caption, author, cover, src, index, create_time, id, isDefault  } = this.props;
        const { musicDelete, musicDefault } = this.props;
        if (index < 10) index = '0' + index;
        const addTime = moment(create_time*1000).format('YYYY-MM-DD HH:mm');
        return(
            <li className="music-list-item">
                <div className="music-index">
                    {index}
                </div>
                <div className="music-item-cover">
                    <img src={cover}/>
                </div>
                <div className="music-item-info">
                    <div className="line caption">
                        <span>歌名：</span><span>{caption}</span>
                    </div>
                    <div className="line author">
                        <span>歌手：</span><span>{author}</span>
                    </div>
                    <div className="line other">
                        <span>添加时间：</span><span>{addTime}</span>
                    </div>
                    <div className="line oper">
                        <Link className="btn-edit" to={`/admin/music/edit/id${id}`} >编辑</Link>
                        <a className="btn-delete" href="javascript:void(0);" onClick={() => musicDelete(id)}>删除</a>
                        {isDefault && <span className="music-default">默认音乐</span>}
                        {!isDefault && <a className="btn-default" href="javascript:void(0);" onClick={() => musicDefault(id)}>设为默认</a>}
                    </div>
                </div>
            </li>
        );
    }
}

class MusicList extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            musics: [],
            loadingMoreMusics: false
        };

        this._setDefaultState(state);
    }
    //删除音乐
    musicDelete = async id => {
        if(window.confirm('真的要删除这首歌吗？')){
            const data = {
                id
            };
            const res = await http.apiPost('/admin/music/delete', data);
            if(res.code == 0){
                alert('删除成功~');
                this._pageUpdate();
            }else{
                alert(res.data);
            }
        }
    };
    //设置为默认音乐
    musicDefault = async id => {
        const data = {
            id
        };
        const res = await http.apiPost('/admin/music/default', data);
        if(res.code == 0){
            alert('设置成功~');
            this._pageUpdate();
        }else{
            alert(res.data);
        }
    };
    render() {
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-music-list" /></Spin>
        }
        const { musics, loadingMoreMusics } = this.state;
        const musicList = musics.map((val, index) => {
            return <MusicItem key={index} {...val} index={index + 1} musicDelete={this.musicDelete} musicDefault={this.musicDefault}/>
        });
        return(
            <div className="admin-music-list slideInUp animated-fast">
                {musicList.length > 0 ? musicList :
                    (loadingMoreMusics ?
                        <div className="music-list-tip">努力加载中//~~</div> :
                        <div className="music-list-tip">没有任何音乐哦//~~</div>)}
            </div>
        );
    }
}

export default PageComponent.withStore(MusicList);