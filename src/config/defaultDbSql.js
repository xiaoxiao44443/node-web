/**
 * Created by xiao on 2017/5/10.
 */
import { dbConfig } from './index';
const prefix = dbConfig.prefix;
import sqlString from '../tool/utils/sqlstring';

//创建表
const article = {
    desc: '文章表',
    sql: `
    CREATE TABLE ${prefix}article (
        id int(11) NOT NULL AUTO_INCREMENT,
        author int(11) NOT NULL COMMENT '作者',
        title varchar(128) NOT NULL COMMENT '文章标题',
        summary text NOT NULL COMMENT '文章摘要',
        text text NOT NULL COMMENT '文章内容',
        main_img int(11) NOT NULL COMMENT '文章主图',
        tags varchar(256) NOT NULL COMMENT '文章标签',
        views int(11) NOT NULL COMMENT '阅读次数',
        comments int(11) NOT NULL COMMENT '评论次数',
        categroy int(11) NOT NULL COMMENT '文章分类',
        create_time bigint(11) NOT NULL COMMENT '创建时间',
        edit_time bigint(11) NOT NULL COMMENT '编辑时间',
        status tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 0整除 -1删除',
        stick tinyint(1) NOT NULL DEFAULT '0' COMMENT '置顶',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表'`
};
const comment = {
    desc: '评论表',
    sql: `
    CREATE TABLE ${prefix}comment (
        id int(11) NOT NULL AUTO_INCREMENT,
        content text NOT NULL COMMENT '评论内容',
        user_id int(11) NOT NULL COMMENT '用户id',
        type varchar(20) NOT NULL DEFAULT '' COMMENT '评论类型[article]',
        type_key varchar(30) NOT NULL DEFAULT '' COMMENT '评论类型key',
        comment_id int(11) NOT NULL DEFAULT '0' COMMENT '评论id',
        reply_id int(11) NOT NULL DEFAULT '0' COMMENT '回复评论id',
        create_time bigint(11) NOT NULL COMMENT '评论时间',
        status tinyint(1) NOT NULL COMMENT '状态 0 -1',
        stick tinyint(1) NOT NULL DEFAULT '0' COMMENT '置顶',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表'`
};
const config = {
    desc: '配置表',
    sql: `
    CREATE TABLE ${prefix}config (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(20) NOT NULL,
        value text NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='配置表'`
};
const image = {
    desc: '图片表',
    sql: `
    CREATE TABLE ${prefix}image (
        id int(11) NOT NULL AUTO_INCREMENT,
        path varchar(256) NOT NULL COMMENT '地址',
        type int(4) NOT NULL COMMENT '类型',
        author int(11) NOT NULL COMMENT '作者',
        md5 char(32) NOT NULL COMMENT '图片md5',
        create_time bigint(11) NOT NULL COMMENT '创建时间',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='图片表'`
};
const user = {
    desc: '用户表',
    sql: `
    CREATE TABLE ${prefix}user (
        id int(11) NOT NULL AUTO_INCREMENT,
        account varchar(20) NOT NULL COMMENT '用户名',
        nickname varchar(15) NOT NULL COMMENT '用户昵称',
        head varchar(256) DEFAULT NULL COMMENT '头像地址',
        password char(32) NOT NULL COMMENT '密码',
        create_time bigint(11) NOT NULL COMMENT '注册时间',
        email varchar(64) NOT NULL COMMENT '电子邮箱',
        profile_url varchar(256) NOT NULL DEFAULT '' COMMENT '微博网址',
        sex tinyint(1) NOT NULL COMMENT '性别0,1,2 未知 女 男',
        group_id int(11) NOT NULL DEFAULT '3' COMMENT '用户组',
        account_type int(4) NOT NULL DEFAULT '0' COMMENT '用户类型0默认 100微博',
        weibo_access_token varchar(64) NOT NULL DEFAULT '' COMMENT '微博access_token',
        weibo_uid varchar(20) NOT NULL DEFAULT '',
        last_login_time bigint(11) NOT NULL COMMENT '上次登录时间',
        login_token varchar(128) NOT NULL DEFAULT '' COMMENT '登录token',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表'`
};
const user_group = {
    desc: '用户组表',
    sql: `
    CREATE TABLE ${prefix}user_group (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(64) NOT NULL COMMENT '名称',
        code varchar(64) NOT NULL COMMENT '代码',
        group_desc varchar(256) NOT NULL COMMENT '描述',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='用户组表'`
};
const friend = {
    desc: '友情链接表',
    sql: `
    CREATE TABLE lo_friend (
        id int(11) NOT NULL AUTO_INCREMENT,
        friend_name varchar(64) NOT NULL COMMENT '博主名字',
        blog_name varchar(64) NOT NULL COMMENT '博客名称',
        blog_url varchar(128) NOT NULL COMMENT '博客地址',
        firend_head varchar(256) NOT NULL COMMENT '博主头像',
        blog_motto varchar(128) NOT NULL DEFAULT '' COMMENT '博主格言',
        create_time bigint(11) NOT NULL,
        update_time bigint(11) NOT NULL,
        status tinyint(1) NOT NULL COMMENT '0正常 -1删除',
        display_order int(11) NOT NULL COMMENT '数字越大越靠前',
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友情链接表'`
};
const motto = {
    desc: '格言表',
    sql: `
    CREATE TABLE lo_motto (
        id int(11) NOT NULL AUTO_INCREMENT,
        text varchar(256) NOT NULL DEFAULT '' COMMENT '格言内容',
        create_time bigint(11) NOT NULL,
        update_time bigint(11) NOT NULL,
        status tinyint(1) NOT NULL COMMENT '0正常 -1已删除',
        used tinyint(1) NOT NULL COMMENT '当前是否正在使用0,1',
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='格言表'`
};
//插入数据
const insert_user_group = {
    desc: '用户组数据',
    sql: `
    INSERT INTO ${prefix}user_group (id, name, code, group_desc) VALUES
        (1, '博主', 'owner', ''),
        (2, '管理员', 'administor', ''),
        (3, '访客', 'vistor', '');`
};
const websiteConfig = {
    site_name: {name: '站点名称', value: '洛哩哩~'},
    site_url: {name: '站点网址', value: ''},
    author: {name: '作者', value: '、  这不科学'},
    application_name: {name: 'application-name', value: ''},
    description: {name: 'description', value: ''},
    keywords: {name: 'keywords', value: ''}
};
const insert_website_config = {
    desc: '网站配置数据',
    sql: `
    INSERT INTO ${prefix}config (id, name, value) VALUES
        (1, 'website', ${sqlString.escape(JSON.stringify(websiteConfig))})`
};
const NOW_TIME = parseInt(Date.now() / 1000);
const insert_motto = {
    desc: '默认格言数据',
    sql: `
    INSERT INTO ${prefix}motto (id, text, create_time, update_time, status, used) VALUES 
    (1, '“只要你能幸福，我是谁，又有什么关系？\r\n记不记得住，又有什么关系啊！”', '${NOW_TIME}', '${NOW_TIME}', '0', '1');`
};

const createTable = [
    article,
    comment,
    config,
    image,
    user,
    user_group,
    friend,
    motto
];

const insert = [
    insert_user_group,
    insert_website_config,
    insert_motto
];

export default {
    createTable,
    insert
}
