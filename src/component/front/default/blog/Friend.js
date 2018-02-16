/**
 * Created by xiao on 2018/2/16.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './friend.css';

class FriendItem extends Component {
    render() {
        const { data:friend } = this.props;
        return (
            <li className="friend-wrap">
                <div className="blog-name">
                    <a href={friend.blog_url} target="_blank"> ■{friend.blog_name}</a>
                </div>
                <div className="friend-head">
                    <a href={friend} target="_blank"><img src={friend.friend_head}/></a>
                </div>
                <div className="friend-name">
                    --{friend.friend_name}
                </div>
                <div className="blog_motto">
                    “{friend.blog_motto}”
                </div>
            </li>
        );
    }
}

class Friend extends Component {
    static propTypes = {
        friends: PropTypes.array
    };
    static defaultProps = {
        friends: []
    };
    render() {
        const list = this.props.friends.map((val, index) => {
            return <FriendItem key={index} data={val}/>
        });
        return (
            <div className="my-friends">
                {list.length > 0 &&
                <ul>
                    {list}
                </ul>}
            </div>
        );
    }
}

export default Friend;