/**
 * Created by xiao on 2018/3/18.
 */
import nodemailer from 'nodemailer';
import { smtpConfig, mailConfig } from '../config';
import userApi from '../api/user';
import commentApi from '../api/comment';
import configApi from '../api/config';
import articleApi from '../api/article';

const adminEmailAddress = smtpConfig.auth.user;
const ownerEmailAddress = mailConfig.owner;
const ownerNickname = mailConfig.owner_nickname;

//邮箱链接验证发送邮件
const send = async message => {
    let transporter = nodemailer.createTransport(smtpConfig);
    transporter.verify(async (error, success) => {
        if (error) {
            console.log('邮箱验证失败:', error);
        } else {
            try {
                await transporter.sendMail(message);
                transporter.close();
                return Promise.resolve('success');
            } catch (err) {
                transporter.close();
                return Promise.reject(err);
            }
        }
    });
};

const getUserInfo = async (user_id, need_email = true) => {
    try {
        const userInfo = await userApi.getUserInfo(user_id);
        if (!userInfo) return Promise.reject(new Error(`该用户id${user_id}不存在`));
        const email = userInfo.email;
        const nickname = userInfo.nickname;
        if (need_email) {
            const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!reg.test(email))  return Promise.reject(new Error('错误的邮箱或未设置邮箱'));
        }
        return Promise.resolve({ nickname, email })
    } catch (err) {
        return Promise.reject(new Error('获取失败'));
    }
};
const getSiteUrl = async () => {
    try {
        const site_config = await configApi.website();
        let site_url = site_config.site_url.value;
        while (site_url.substr(-1) == '/') {
            site_url = site_url.slice(0, -1);
        }
        return Promise.resolve(site_url)
    } catch (err) {
        return Promise.reject(new Error('获取失败'));
    }
};

const sendReplyMall = async (comment_id) => {
    try {

        //回复from---
        let commentInfo = await commentApi.getCommentInfo(comment_id);
        if (!commentInfo) return Promise.reject(new Error(`该回复${comment_id}不存在或已删除`));
        const comment_type = commentInfo.type;
        const reply_id = commentInfo.reply_id;
        const target_comment_id = commentInfo.comment_id;
        const type_key = commentInfo.type_key;
        const reply_content = commentInfo.content;
        const reply_uid = commentInfo.user_id;
        const site_url = await getSiteUrl();

        //生成地址
        let url, title, subject, article_title;
        if (comment_type == 'article') {
            url = site_url + `/blog/ad${type_key}#comment-${comment_id}`;
            title = '你在洛哩哩~有了新的文章评论';
            subject = '您收到来自洛哩哩~的文章评论';
            //文章标题查找
            const articleInfo = await articleApi.getArticle(type_key);
            if (!articleInfo) return Promise.reject('该评论文章不存在或已被删除');
            article_title = articleInfo.title;
        }
        if (comment_type == 'message-board') {
            url = site_url + `/message-board/#comment-${comment_id}`;
            title = '你在洛哩哩~有了新的留言';
            subject = '您收到来自洛哩哩~的留言';
        }

        if (target_comment_id == 0 && reply_id == 0) {
            //对文章的评论或留言板留言

            //reply_uid==1 即博主自己回复文章和留言板不做邮件通知
            if (reply_uid == 1) return Promise.resolve('博主自己的评论不做邮件通知');

            let quoteHtml = '';
            if (comment_type == 'article') {
                quoteHtml = `
                    <blockquote style="font-size: 1em;border-left:.3em solid #eee;padding:.6em 1.2em;margin:0 0 1.2em;line-height:1.6;color:#999">
                        【${article_title}】
                    </blockquote>`;
            }
            //评论from--
            const replyUserInfo = await getUserInfo(reply_uid, false);
            const reply_nickname = replyUserInfo.nickname;

            let template = `
            <div style="width:700px;margin:4em auto;box-sizing:border-box;border-top:1px dashed #ccc">
                <p style="text-align: right;color: #666;">&lt;&lt;&lt;洛哩哩官方系统邮件，请勿回复</p>
                <p style="font-weight:bold">${title}：</p>
                ${quoteHtml}
                <p style="padding-left:1.2em;line-height:1.6">${reply_nickname}：${reply_content}</p>
                <p style="margin:2em 0"><a style="color:#e44c65" href="${url}">>>>点击查看~~~</a></p>
            </div>
        `;
            const emailMessage = {
                from: `洛哩哩官方系统邮件 <${adminEmailAddress}>`,
                to: `${ownerNickname} <${ownerEmailAddress}>`,
                subject: subject,
                text: subject,
                html: template
            };
            await send(emailMessage);

        } else {
            //文章评论的回复或留言板留言的回复
            commentInfo = await commentApi.getCommentInfo(target_comment_id);
            if (!commentInfo) return Promise.reject(new Error(`该回复目标id${pr_comment_id}不存在或已删除`));
            //回复from--
            const replyUserInfo = await getUserInfo(reply_uid, false);
            const reply_nickname = replyUserInfo.nickname;

            //回复to--
            const target_uid = commentInfo.user_id;
            const targetUserInfo = await getUserInfo(target_uid);
            const quote = commentInfo.content;
            const target_nickname = targetUserInfo.nickname;
            const target_email = targetUserInfo.email;

            //自己回复自己不做通知
            if (reply_uid == target_uid) return Promise.resolve('本人回复不做通知');

            let articleTitleHtml = '';
            if (comment_type == 'article') {
                articleTitleHtml = `【${article_title}】<br/>`;
            }

            let template = `
            <div style="width:700px;margin:4em auto;box-sizing:border-box;border-top:1px dashed #ccc">
                <p style="text-align: right;color: #666;">&lt;&lt;&lt;洛哩哩官方系统邮件，请勿回复</p>
                <p style="font-weight:bold">你在洛哩哩~有了新的回复：</p>
                <blockquote style="font-size: 1em;border-left:.3em solid #eee;padding:.6em 1.2em;margin:0 0 1.2em;line-height:1.6;color:#999">
                    ${articleTitleHtml}${target_nickname}： ${quote}
                </blockquote>
                <p style="padding-left:1.2em;line-height:1.6">${reply_nickname}：${reply_content}</p>
                <p style="margin:2em 0"><a style="color:#e44c65" href="${url}">>>>点击访问回复地址~~~</a></p>
            </div>
        `;
            const emailMessage = {
                from: `洛哩哩官方系统邮件 <${adminEmailAddress}>`,
                to: `${target_nickname} <${target_email}>`,
                subject: '您收到来自洛哩哩~的新回复',
                text: '您收到来自洛哩哩~的新回复',
                html: template
            };
            await send(emailMessage);
        }

        return Promise.resolve('已发送~');
    } catch (err) {
        console.log(err);
        return Promise.reject(new Error('发送失败'));
    }

};

export default {
    sendReplyMall
};