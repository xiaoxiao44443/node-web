/**
 * Created by xiao on 2017/5/17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './articleComment.css';
import moment from 'moment';
moment.locale('zh-cn');
import http from '../../../../tool/http';
import Spin from '../../../common/tool/Spin';
import { scroll2ElementByClassName as scroll2Element } from '../../../../tool/dom-js';

//移除http
const removeHttp = (url) => {
    if (!url) return '';
    return url.substring(0,7)== 'http://' ? url.substring(5) : url;
};

/**
 * 分页计算
 */
const Pagination = ({ nowPage, maxPage, pageOnChange }) => {

    const onChange = (page) => {
        if(typeof pageOnChange === 'function'){
            pageOnChange(page);
        }
    };

    let page = [];

    if(nowPage > 1){
        page.push(
            <span className="page-up" key='page-up' onClick={() => onChange(nowPage - 1)}>上一下</span>
        )
    }
    for(let i=1; i<=maxPage; i ++){
        if(i == nowPage){
            page.push(
                <span className="now-page" key={i}>{i}</span>
            );
        }
        else if(i<nowPage+4 && i!=maxPage){
            page.push(
                <span className="number-link" key={i} onClick={() => onChange(i)}>{i}</span>
            );
        }else if(i==maxPage){
            page.push(
                <span className="number-link" key={i} onClick={() => onChange(i)}>{i}</span>
            );
        }

        if(i == nowPage + 3 && i < maxPage-1) {
            page.push(
                <span key='dot'>...</span>
            )
        }
    }
    if(nowPage < maxPage){
        page.push(
            <span className="page-down" key='page-down' onClick={() => onChange(nowPage + 1)}>下一页</span>
        )
    }

    return (
        maxPage > 0 ? <div className="header-page"><span>共 {maxPage} 页</span> {page}</div>: null
    );
};

class CommentItem extends Component {
    constructor(props){
        super(props);
        this.state = {
            comment: props.data,
            replies: props.data.replies,
            showCommentBox: false,
            commentContextInput: '',
            lastCommentContextInput: '',
            maxContentNum: 140,
            publishingComment: false,
            page: 1,
            loading: false,
            normalReplyCont: 3,
            showAll: false,
            reply_id: 0,
            updateUser: false,
        }
    }
    async componentDidMount(){
        const { nowPage } = this.props;
        if (nowPage === undefined) return;
        await this.queryReply(nowPage);
        if (typeof this.props.onDidMount === 'function') this.props.onDidMount();
    }
    async componentWillReceiveProps(nextProps){
        if(nextProps.nowPage !== undefined){
            await this.queryReply(nextProps.nowPage);
            if (typeof this.props.onDidMount === 'function') this.props.onDidMount();
        }
        if(nextProps.nowReplyBox != this.state.comment.id){
            this.setState({
                showCommentBox: false
            });
        }
        if(nextProps.data.id != this.state.comment.id){
            this.setState({
                comment: nextProps.data,
                replies: nextProps.data.replies
            });
        }
    }
    queryReply = async p => {

        const { loading, comment } = this.state;
        if(loading) return;
        this.setState({
            loading: true
        });

        let data = {
            p: p || this.state.page,
            id: comment.id
        };

        const res = await http.apiPost('/comment/query-reply', data);
        this.setState({
            loading: false
        });
        if(res.code == 0){
            this.setState({
                replies: res.data,
                page: res.data.nowPage,
                showAll: true
            });
        }else{
            alert(res.data);
        }
    };
    showCommentBox = (author, reply_id = 0) => {
        if(!this.props.user){
            alert('登陆后才可以参与回复评论哦～');
            return;
        }
        const content = author ? `回复 @${author}：` : '';
        this.setState({
            showCommentBox: true,
            commentContextInput: content,
            reply_id: reply_id
        });
        const { replyBoxOnShow } = this.props;
        if(typeof replyBoxOnShow === 'function'){
            replyBoxOnShow(this.state.comment.id);
        }
    };
    hideCommentBox = () => {
        this.setState({
            showCommentBox: false
        });
        const { replyBoxOnShow } = this.props;
        if(typeof replyBoxOnShow === 'function'){
            replyBoxOnShow(false);
        }
    };
    commentContextOnChange = (event) => {
        let content = event.target.value;
        const { maxContentNum } = this.state;
        if(content.length > maxContentNum){
            content = content.substr(0, maxContentNum);
        }
        this.setState({
            commentContextInput: content
        });
    };
    publishComment = () => {
        if(this.state.publishingComment) return;

        if(!this.state.showCommentBox){
            this.showCommentBox();
            return;
        }
        if(!this.props.user){
            alert('请先登录');
        }

        //输入验证
        const { commentContextInput, lastCommentContextInput, comment } = this.state;

        if(commentContextInput.length == 0){
            alert('你什么都没有输入，说点什么吧~');
            return;
        }
        if(commentContextInput.trim().length == 0){
            alert('请不要全空白，我看不懂');
            return;
        }
        //连续回复相同验证
        if(lastCommentContextInput!=='' && lastCommentContextInput === commentContextInput){
            alert('请不要连续回复相同的内容');
            return;
        }

        const { reply_id } = this.state;


        this.setState({
            publishingComment: true
        });

        const data = {
            comment_id: comment.id,
            reply_id: reply_id,
            content: commentContextInput
        };

        http.apiPost('/comment/reply', data).then(res => {
            this.setState({
                publishingComment: false
            });
            if(res.code == 0){
                this.setState({
                    commentContextInput: '',
                    lastCommentContextInput: commentContextInput
                });
                this.hideCommentBox();
                alert('发表成功~');
                this.queryReply();
            }else{
                if(res.data == '请先登录~'){
                    //跳到授权登录
                    alert(res.data);
                }else{
                    alert(res.data);
                }

            }
        });
    };
    pageOnChange = (page) => {
        this.setState({
            page: page
        });
        this.queryReply(page);
    };
    readMore = () => {
        this.queryReply();
    };
    render(){
        const { user } = this.props;
        const { comment, replies, showCommentBox, commentContextInput, maxContentNum, normalReplyCont, showAll } = this.state;
        const replyList = replies.list.map(val => {
            const reply = val;
            const create_time = reply.create_time * 1000;
            //12小时前显示完整时间
            const time = moment().subtract('12', 'h').valueOf() < create_time ? moment(create_time).fromNow() : moment(create_time).format('YYYY-MM-DD HH:mm');
            return (
                <li className="reply-item" key={reply.id} id={`comment-${reply.id}`}>
                    <div className="reply-user-head">
                        {reply.account_type == 100 ?
                            <a href={'http://weibo.com/' + reply.profile_url} target="_blank"><img src={reply.user_head}/></a>:
                            <a href="javascript:void(0);"><img src={removeHttp(reply.user_head)}/></a>
                        }
                    </div>
                    <div className="reply-content-wrap">
                        <div className="reply-nickname">
                            {reply.account_type == 100 ?
                                <a href={'http://weibo.com/' + reply.profile_url} target="_blank">{reply.nickname}</a>:
                                <a href="javascript:void(0);">{reply.nickname}</a>
                            }
                        </div>
                        <p className="text">{reply.content}</p>
                        <div className="reply-info">
                            <span className="time">{time}</span>
                            <span className="rebly btn-hover" onClick={()=>{this.showCommentBox(reply.nickname, reply.id)}}>回复</span>
                            <span className="report btn-hover">举报</span>
                        </div>
                    </div>
                </li>
            );
        });
        const create_time = comment.create_time * 1000;
        //12小时前显示完整时间
        const time = moment().subtract('12', 'h').valueOf() < create_time ? moment(create_time).fromNow() : moment(create_time).format('YYYY-MM-DD HH:mm');
        const leftReplyNum = replies.count - normalReplyCont > 0 ? replies.count - normalReplyCont : 0;

        return(
            <li className="comment-item" id={`comment-${comment.id}`}>
                <div className="user-head">
                    {comment.account_type == 100 ?
                        <a href={'https://weibo.com/' + comment.profile_url} target="_blank"><img src={removeHttp(comment.user_head)}/></a>:
                        <a href="javascript:void(0);"><img src={removeHttp(comment.user_head)}/></a>
                    }
                </div>
                <div className="content-wrap">
                    <div className="nickname">
                        {comment.account_type == 100 ?
                            <a href={'http://weibo.com/' + comment.profile_url} target="_blank">{comment.nickname}</a>:
                            <a href="javascript:void(0);">{comment.nickname}</a>}
                    </div>
                    <p className="text">{comment.content}</p>
                    <div className="info">
                        <span className="time">{time}</span>
                        <span className="rebly btn-hover" onClick={()=>{this.showCommentBox()}}>回复</span>
                        <span className="report btn-hover">举报</span>
                    </div>
                    <ul className="reply-box">
                        {replyList}
                    </ul>
                    {
                        !showAll && leftReplyNum > 0 ?
                        <div className="view-more">
                            还有<b>{leftReplyNum}</b>条回复，<a href="javascript:void(0);" onClick={this.readMore}>点击查看</a>
                        </div> : null
                    }
                    {
                        showAll ?
                            <Pagination nowPage={replies.nowPage} maxPage={replies.maxPage} pageOnChange={this.pageOnChange}/>
                            :null
                    }
                    {showCommentBox ?
                        <div className="comment-box">
                            <div className="comment-box-title"><span>最大字数：{commentContextInput.length}/{maxContentNum}</span></div>
                            <div className="comment-box-write">
                                <div className="user-head">
                                    <img src={removeHttp(user.head)}/>
                                </div>
                                <div className="textarea-container">
                            <textarea className="comment-textarea" value={commentContextInput}
                                      onChange={this.commentContextOnChange}
                                      placeholder="请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。"/>
                                </div>
                            </div>
                            <div className="comment-box-oper">
                                <a className="btn-cancel" href="javascript:void(0);" onClick={this.hideCommentBox}>收起</a>
                                <a className="btn-submit" href="javascript:void(0);" onClick={this.publishComment}>发表评论</a>
                            </div>
                        </div>: <div className='comment-box' style={{height: 0}}/> }
                </div>
            </li>
        );
    }
}

CommentItem.propTypes = {
    replyBoxOnShow: PropTypes.func,
    nowReplyBox: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number,
    ]),
    user: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
    ]),
    onDidMount: PropTypes.func
};

class ArticleComment extends Component {
    constructor(props){
        super(props);
        this.state = {
            comments: {
                count: 0,
                pageSize: 0,
                maxPage: 0,
                nowPage: 1,
                list: []
            },
            page: 1,
            findComment: {},  //用于该评论下预加载指定页回复
            loading: false,
            showCommentBox: false,
            user: false,
            commentContextInput: '',
            lastCommentContextInput: '',
            maxContentNum: 140,
            publishingComment: false,
            nowReplyBox: false,
            lasHashCommentHash: props.hashCommentHash,
            hashChange: false
        }
    }
    async componentDidMount(){
        await this.findComment();
        await this.queryComment();
        await this.updateUserInfo();
        if (this.state.findComment.reply_page === 0) this.callDidMount();
    }

    componentDidUpdate(prevProps, prevState){
        if(!prevState.showCommentBox && this.state.showCommentBox){
            scroll2Element('article-comment-wrap');
        }
    }
    async componentWillReceiveProps(nextProps){
        const { lasHashCommentHash } = this.state;
        if (nextProps.hashCommentHash !== '' && nextProps.hashCommentHash !== lasHashCommentHash){
            this.setState({
                lasHashCommentHash: nextProps.hashCommentHash
            });
            await this.findComment(nextProps);
            await this.queryComment();
            if (this.state.findComment.reply_page  === 0) this.callDidMount();
        }
    }
    callDidMount = () => {
        if (!this.state.hashChange) return;
        this.setState({
            hashChange: false,
            findComment: {}
        });
        if (this.props.onDidMount) this.props.onDidMount();
    };
    updateUserInfo = async () => {
        if(this.state.updateUser) return;
        this.setState({
            updateUser: true
        });

        const res = await http.apiGet('/user/check-login');
        this.setState({
            updateUser: false
        });
        if(res.code == 0){
            this.setState({
                user: res.data
            });
        }
    };
    //查找哈希评论id页码
    findComment = async props => {
        const { hashCommentHash } = props || this.props;
        if (hashCommentHash === '') return;
        this.setState({
            hashChange: true
        });
        const hashCommentId = hashCommentHash.replace(/^#comment-/, '');
        if (isNaN(hashCommentId)) return;
        const data = {
            id: parseInt(hashCommentId)
        };
        const res = await http.apiPost('/comment/find-comment', data);
        if (res.code == 0) {
            this.setState({
                page: res.data.comment_page,
                findComment: res.data
            });
        }
    };
    queryComment = async p => {

        const { loading } = this.state;
        const { type, type_key } = this.props;
        if(loading) return;
        this.setState({
            loading: true
        });

        let data = {
            p: p || this.state.page,
            type: type
        };

        data.type = type;
        if(type_key) data.type_key = type_key;

        const res = await http.apiPost('/comment/query', data);
        this.setState({
            loading: false
        });
        if(res.code == 0){
            this.setState({
                comments: res.data,
                p: res.data.nowPage
            });
        }else{
            alert(res.info);
        }
    };
    showCommentBox = () => {
        this.setState({
            showCommentBox: true
        });
    };
    hideCommentBox = () => {
        this.setState({
            showCommentBox: false
        });
    };
    commentContextOnChange = (event) => {
        let content = event.target.value;
        const { maxContentNum } = this.state;
        if(content.length > maxContentNum){
            content = content.substr(0, maxContentNum);
        }
        this.setState({
            commentContextInput: content
        });
    };
    publishComment = () => {
        if(this.state.publishingComment) return;

        if(!this.state.showCommentBox){
            this.showCommentBox();
            return;
        }
        if(!this.state.user){
            alert('请先登录');
        }

        //输入验证
        const { commentContextInput, lastCommentContextInput } = this.state;

        if(commentContextInput.length == 0){
            alert('你什么都没有输入，说点什么吧~');
            return;
        }
        if(commentContextInput.trim().length == 0){
            alert('请不要全空白，我看不懂');
            return;
        }
        //连续回复相同验证
        if(lastCommentContextInput!=='' && lastCommentContextInput === commentContextInput){
            alert('请不要连续回复相同的内容');
            return;
        }


        this.setState({
            publishingComment: true
        });

        const { type, type_key } = this.props;

        const data = {
            type: type,
            type_key: type_key,
            content: commentContextInput
        };

         http.apiPost('/comment/send', data).then(res => {
             this.setState({
                 publishingComment: false
             });
             if(res.code == 0){
                 this.setState({
                     commentContextInput: '',
                     lastCommentContextInput: commentContextInput
                 });
                 alert('发表成功~');
                 this.queryComment();
             }else{
                 if(res.data == '请先登录~'){
                     //跳到授权登录
                     alert(res.data);
                 }else{
                     alert(res.data);
                 }

             }
         });
    };
    pageOnChange = (page) => {
        this.setState({
            page: page,
            findComment: {}
        });
        setTimeout(() => scroll2Element('comment-list-title'), 50);
        this.queryComment(page);
    };
    replyBoxOnShow = (id) => {
        this.setState({
            nowReplyBox: id
        });
    };
    render(){
        const { comments, showCommentBox, commentContextInput, maxContentNum, loading, nowReplyBox, user, findComment } = this.state;
        const commentList = this.state.comments.list.map(val => {
            let nowPage;
            if (findComment.comment_id === val.id && findComment.reply_page >= 1){
                nowPage = findComment.reply_page;
            }
            return <CommentItem data={val} key={val.id} nowPage={nowPage} onDidMount={this.callDidMount} replyBoxOnShow={() => {this.replyBoxOnShow(val.id)}} nowReplyBox={nowReplyBox} user={user} />
        });
        return (
            <div className="article-comment-wrap">
                <Spin loading={loading}/>
                <div className="comment-title">
                    <h3 className="multi-border-hl">
                        <span>发表评论</span>
                    </h3>
                </div>
                <div className={ 'comment-box' + (!showCommentBox ? ' min' : '')}>
                    {showCommentBox ? <div className="comment-box-title"><span>最大字数：{commentContextInput.length}/{maxContentNum}</span></div> : null}
                    {showCommentBox ?
                        <div className="comment-box-write">
                            <div className="user-head">
                                <img src={removeHttp(user.head)}/>
                            </div>
                            <div className="textarea-container">
                            <textarea className="comment-textarea" value={commentContextInput}
                                      onChange={this.commentContextOnChange}
                                      placeholder="请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。"/>
                            </div>
                        </div> : null
                    }
                    <div className="comment-box-oper">
                        {showCommentBox ? <a className="btn-cancel" href="javascript:void(0);" onClick={this.hideCommentBox}>收起</a> : null}
                        {/*{user?*/}
                            {/*<a className="btn-submit" href="javascript:void(0);" onClick={this.publishComment}>发表评论</a>*/}
                            {/*: <a className="btn-submit" href="/login/jump-weibo">请先登录</a>}*/}
                        {user?
                        <a className="btn-submit" href="javascript:void(0);" onClick={this.publishComment}>发表评论</a>
                        : [
                                <a href="/login/jump-weibo" key="weibo"><img src="/static/images/default/weibo-login.png"/></a>,
                                <a style={{marginLeft:'5px'}} href="/login/jump-zslm" key="zslm">作死联萌登录</a>
                            ]}
                        {user && !showCommentBox ?
                            <a style={{marginLeft: '1em'}} href="/logout">退出登录</a> : null }
                    </div>
                </div>
                <div className="comment-title">
                    <span className="comment-count">{comments.total_count} 评论</span>
                </div>
                <div className="comment-title comment-list-title">
                    <h3 className="multi-border-hl">
                        <span>{comments.count <= 0 ? '暂无评论' : '全部评论'}</span>
                    </h3>
                </div>
                <div className="comment-list">
                    <Pagination nowPage={comments.nowPage} maxPage={comments.maxPage} pageOnChange={this.pageOnChange}/>
                    <ul className="comment-ul">
                        {commentList}
                    </ul>
                    <Pagination nowPage={comments.nowPage} maxPage={comments.maxPage} pageOnChange={this.pageOnChange}/>
                </div>
            </div>
        );
    }
}

ArticleComment.propTypes = {
    type: PropTypes.string.isRequired,
    type_key: PropTypes.any,
    hashCommentId: PropTypes.number,
    onDidMount: PropTypes.func
};
ArticleComment.defaultProps = {
    hashCommentHash: ''
};

export default ArticleComment;