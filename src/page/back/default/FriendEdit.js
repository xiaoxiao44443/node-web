/**
 * Created by xiao on 2018/2/15.
 */
import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import http from '../../../tool/http';
import Spin from '../../../component/common/tool/Spin';
import './friendEdit.css';
import PicSelector from '../../../component/back/default/common/PicSelector';

const FormInput = props => {
    return <input className="admin-form-input" type="text" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class FriendEdit extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            friend: {
                friend_name: '',
                blog_name: '',
                blog_url: '',
                blog_motto: '',
                friend_head: '',
                display_order: 0
            },
            showSelectPicModal: false
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.friend){
            let friend = {...this.state.friend};
            friend[name] = value;
            this.setState({ friend });
        }
    };
    addFriend = async () => {
        if(this.state.loading) return;
        const { friend_name, friend_head, blog_name, blog_motto, blog_url, display_order } = this.state.friend;
        if (friend_name.length == 0){
            alert('请输入友人昵称!');
            return;
        }
        if (blog_name.length == 0){
            alert('请输入博客名称!');
            return;
        }
        if (blog_url.length == 0){
            alert('请输入博客地址!');
            return;
        }
        if (friend_head.length == 0){
            alert('请设置博客头像!');
            return;
        }
        if (isNaN(display_order) || display_order.length == 0){
            alert('必须输入数字优先级!');
            return;
        }

        //id小于0约定为添加友联
        const data = {
            id: -1,
            friend: {
                friend_name, friend_head, blog_name, blog_url, display_order, blog_motto
            }
        };

        this.setState({ loading: true });
        const res = await http.apiPost('/admin/friend/edit', data);
        this.setState({
            loading: false
        });

        if(res.code == 0){
            alert('添加成功~');
            return this.props.history.push('/admin/friend/list');
        }else{
            alert(res.data);
        }

    };
    saveFriend = async () => {
        if(this.state.loading) return;
        const { friend_name, friend_head, blog_name, blog_motto, blog_url, display_order, id } = this.state.friend;
        if(!id){
            alert('友人数据出错,请刷新重试');
            return;
        }
        if (friend_name.length == 0){
            alert('请输入友人昵称!');
            return;
        }
        if (blog_name.length == 0){
            alert('请输入博客名称!');
            return;
        }
        if (blog_url.length == 0){
            alert('请输入博客地址!');
            return;
        }
        if (friend_head.length == 0){
            alert('请设置博客头像!');
            return;
        }
        if (isNaN(display_order) || display_order.length == 0){
            alert('必须输入数字优先级!');
            return;
        }

        //id小于0约定为添加友联
        const data = {
            id,
            friend: {
                friend_name, friend_head, blog_name, blog_url, display_order, blog_motto
            }
        };

        this.setState({ loading: true });
        const res = await http.apiPost('/admin/friend/edit', data);
        this.setState({
            loading: false
        });

        if(res.code == 0){
            alert('保存成功~');
        }else{
            alert('服务器返回异常');
        }

    };
    showSelectPicModel = () => {
        this.setState({
            showSelectPicModal: true
        });
    };
    closeSelectPicModel = () => {
        this.setState({
            showSelectPicModal: false
        });
    };
    setFriendHead = id => {
        if(isNaN(id)) {
            alert('错误的图片');
            return;
        }
        let friend = {...this.state.friend};
        friend.friend_head = `/api/pic${id}`;
        this.setState({
            friend
        });
    };
    render() {
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-friend-edit"/></Spin>
        }

        const { id, friend_name, blog_name, blog_motto, friend_head, blog_url, display_order } = this.state.friend;
        const formInputOnChange = this.formInputOnChange;
        return (
            <div className="admin-friend-edit slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>友人编辑~~</h2>
                    <h5>【友人昵称】</h5>
                    <FormInput name="friend_name" value={friend_name} onChange={formInputOnChange} />
                    <h5>【博客名称】</h5>
                    <FormInput name="blog_name" value={blog_name} onChange={formInputOnChange} />
                    <h5>【博客地址】</h5>
                    <FormInput name="blog_url" value={blog_url} onChange={formInputOnChange} />
                    <h5>【博客格言】</h5>
                    <FormInput name="blog_motto" value={blog_motto} onChange={formInputOnChange} />
                    <h5>【博客头像】</h5>
                    <FormInput name="friend_head" value={friend_head} onChange={formInputOnChange} />
                    <div className="friend-head" onClick={this.showSelectPicModel}>
                        {friend_head.length > 0 && <img className="img-head" src={friend_head}/>}
                    </div>
                    <PicSelector show={this.state.showSelectPicModal} onClose={this.closeSelectPicModel} picType={2} onConfirm={this.setFriendHead} />
                    <h5>【优先级】(数字越大排序越前)</h5>
                    <FormInput name="display_order" value={display_order} onChange={formInputOnChange} />
                </div>
                <div className="admin-form-group text-right">
                    {id ? <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveFriend}>{this.state.loading ? '保存...': '保存'}</a> :
                        <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.addFriend}>{this.state.loading ? '添加...': '添加'}</a>}
                    <Link className="btn btn-cancel" to="/admin/music/list">取消</Link>
                </div>
            </div>
        );
    }
}

export default PageComponent.withStore(FriendEdit);