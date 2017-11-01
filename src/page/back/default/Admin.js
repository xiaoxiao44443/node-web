/**
 * Created by xiao on 2017/5/13.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../component/back/default/common/Header';
import './admin.css';
import PageComponent from '../../../component/common/base/PageComponent';
import { NavLink, Switch, Route, withRouter } from 'react-router-dom';
import classNames from 'classnames';

import AdminConfig from './Config';
import AdminArticleList from './ArticleList';
import AdminArticleWrite from './ArticleWrite';
import Welcome from './Welcome';
import NotFound from '../../../component/common/Status/NotFound';
import AdminRecommend from './Recommend';

const navData = [
    {
        icon: 'icon-dashboard',
        name: 'Dashboard',
        link: '/admin'
    },
    {
        icon: 'icon-book',
        name: '文章',
        children: [
            {
                name: '所有文章',
                link: '/admin/article/list'
            },
            {
                name: '写文章',
                link: '/admin/article/write'
            }
        ]
    },
    {
        icon: 'icon-link',
        name: '友链管理',
        link: '/admin/friend-link'
    },
    {
        icon: 'icon-book',
        name: '推荐管理',
        link: '/admin/recommend'
    },
    {
        icon: 'icon-cogs',
        name: '站点设置',
        link: '/admin/site-config'
    },
];


class Nav extends Component {
    constructor(props){
        super(props);
        this.showSubNav = this.showSubNav.bind(this);
    }
    showSubNav(){
        if(this.props.popped) this.props.popped(this.props.navId, !this.props.open);
    }
    render(){

        const { nav } = this.props;
        const { open, active } = this.props;

        let subNav;
        if(nav.children && nav.children.length > 0){
            subNav = nav.children.map((val, index) => {
                return(
                    <li className="sub-menu-li" key={index}>
                        {val.link ?
                            <NavLink exact to={val.link} activeClassName="sub-active">{val.name}</NavLink>:
                            <a href="javascript:void(0);" >{val.name}</a>
                        }
                    </li>
                );
            });
        }
        subNav = subNav && <ul className="sub-menu" style={{display: open ? 'block' : 'none'}}>{subNav}</ul>;

        return (
            <li className={'menu-li' + (active ? ' active' : '')}>
                {nav.link ?
                    <NavLink exact to={nav.link} onClick={this.showSubNav}>
                        <i className={nav.icon} />
                        <span>{nav.name}</span>
                        {subNav ? <span className={'arrow' + (open ? ' open' : '')} /> : null}
                    </NavLink>:
                    <a href="javascript:void(0);" onClick={this.showSubNav}>
                        <i className={nav.icon} />
                        <span>{nav.name}</span>
                        {subNav ? <span className={'arrow' + (open ? ' open' : '')} /> : null}
                    </a>
                }
                {subNav}
            </li>
        );
    }
}
class SideNav extends Component {
    constructor(props){
        super(props);
        let nowNavId = -1;
        let open = false;

        const { match } = props;

        props.nav.forEach((val, index) => {
            if(val.link == match.url) nowNavId =  index;
            if(val.children && val.children.length > 0){
                val.children.forEach(subNav => {
                    if(subNav.link === match.url) {
                        nowNavId = index;
                        open = true;
                    }
                });
            }
        });

        this.state = {
            nowNavId,
            open
        };

        this.popped = this.popped.bind(this);
    }
    popped(navId, open){
        this.setState({nowNavId: navId, open: open});
    }
    render(){

        const nav = this.props.nav;
        const list = nav.map((val,index) => {

            return this.state.nowNavId !=index ? <Nav nav={val} key={index} navId={index} popped={this.popped} active={false} />:
                <Nav nav={val} key={index} navId={index} popped={this.popped} active={true} open={this.state.open} />
        });

        return (
            <div className="admin-side-nav slideInLeft animated-fast">
                <ul className="sidebar-menu">
                    {list}
                </ul>
            </div>
        );
    }
}
SideNav.propTypes = {
    nav: PropTypes.array
};
SideNav.defaultProps = {
    nav: [
        {
            icon: 'icon-dashboard',
            name: 'Dashboard',
            link: '/admin'
        }
    ]
};
SideNav = withRouter(SideNav);

class Admin extends PageComponent{
    constructor(props){
        super(props);
        const state = {
            showSideNav: true,
            user: {
                nickname: ''
            }
        };
        this._setDefaultState(state);
        this.toggleSideNav = this.toggleSideNav.bind(this);
    }
    toggleSideNav(){
        this.setState({showSideNav: !this.state.showSideNav});
    }
    componentWillReceiveProps(nextProps){

    }
    render(){
        const { showSideNav, user } = this.state;
        const mainWrapClass = classNames({
            'main-wrap admin': true,
            showSideNav: showSideNav
        });
        return (
            <div className={mainWrapClass}>
                <Header toggle={this.toggleSideNav} user={user} />
                <SideNav nav={navData}/>
                <div className="admin-main">
                    <Switch>
                        <Route exact path="/admin" component={Welcome}/>
                        <Route path="/admin/article/list" component={AdminArticleList}/>
                        <Route path="/admin/article/edit/ad([0-9]+)" component={AdminArticleWrite}/>
                        <Route path="/admin/article/write" component={AdminArticleWrite}/>
                        <Route path="/admin/site-config" component={AdminConfig}/>
                        <Route path="/admin/recommend" component={AdminRecommend}/>
                        <Route component={NotFound}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default PageComponent.withStore(Admin);