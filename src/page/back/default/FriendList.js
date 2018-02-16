/**
 * Created by xiao on 2018/2/15.
 */
import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import http from '../../../tool/http';
import './friendList.css';
import moment from 'moment';
import Spin from '../../../component/common/tool/Spin';

class FriendItem extends Component {
    render() {
        let { data:friend, index } = this.props;
        const { friendDelete } = this.props;
        if (index < 10) index = '0' + index;
        const id = friend.id;
        const addTime = moment(friend.create_time*1000).format('YYYY-MM-DD HH:mm');
        return(
            <li className="friend-list-item">
                <div className="friend-index">
                    {index}
                </div>
                <div className="friend-item-head">
                    <img src={friend.friend_head}/>
                </div>
                <div className="friend-item-info">
                    <div className="line friend-name">
                        <span>友人昵称：</span><span>{friend.friend_name}</span>
                    </div>
                    <div className="line blog-name">
                        <span>博客名称：</span><span>{friend.blog_name}</span>
                    </div>
                    <div className="line blog-motto">
                        <span>格言：</span><span>{friend.blog_motto}</span>
                    </div>
                    <div className="line other">
                        <span>添加时间：</span><span>{addTime}</span>
                    </div>
                    <div className="line oper">
                        <Link className="btn-edit" to={`/admin/friend/edit/ad${id}`} >编辑</Link>
                        <a className="btn-delete" href="javascript:void(0);" onClick={() => friendDelete(id)}>删除</a>
                    </div>
                </div>
            </li>
        );
    }
}

class FriendList extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            friends: [],
            loadingMoreFriends: false,
            noMoreFriends: false
        };

        this._setDefaultState(state);
    }
    //删除音乐
    friendDelete = async id => {
        if(window.confirm('真的要删除这个朋友吗？')){
            const data = {
                ad: id
            };
            const res = await http.apiPost('/admin/friend/delete', data);
            if(res.code == 0){
                alert('删除成功~');
                this._pageUpdate();
            }else{
                alert(res.data);
            }
        }
    };
    loadMoreFriends = async () => {
        if(this.state.loadingMoreFriends) return;
        this.setState({
            loadingMoreFriends: true
        });
        const p = this.state.nowPage || 1;
        //加载更多文章
        const url = this.props.match.url;
        const data = {
            p: p + 1
        };
        const res = await http.apiPost(url, data);

        this.setState({
            loadingMoreFriends: false
        });
        if(res.code == 0){
            if(res.data.length == 0){
                this.setState({
                    noMoreFriends: true
                });
                this._pageSave({
                    noMoreFriends: true
                });
                return;
            }
            const newFriends = this.state.friends.concat(res.data);
            this.setState({
                friends: newFriends,
                nowPage: p + 1,
                noMoreFriends: false
            });
            this._pageSave({
                friends: newFriends,
                noMoreFriends: false,
                nowPage: p + 1
            })
        }else{
            alert('服务器返回异常');
        }

    };
    render() {
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-friend-list" /></Spin>
        }
        const { friends, loadingMoreFriends, noMoreFriends } = this.state;
        const friendList = friends.map((val, index) => {
            return <FriendItem key={index} data={val} index={index + 1} friendDelete={this.friendDelete}/>
        });
        const loadingMoreFriendsTip = !loadingMoreFriends ? (!noMoreFriends ? '加载更多' :'已经到底了//~~') : '努力加载中//~~';
        const loadMore = <div className="load-more"><a href="javascript:void(0);" onClick={this.loadMoreFriends}>{loadingMoreFriendsTip}</a></div>;
        return(
            <div className="admin-friend-list slideInUp animated-fast">
                {
                    friendList.length > 0 ? <ul>{friendList}</ul> : <div className="friend-list-tip">没有任何朋友哦//~~</div>
                }
                {loadMore}
            </div>
        );
    }
}

export default PageComponent.withStore(FriendList);