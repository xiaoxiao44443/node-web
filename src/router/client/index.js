/**
 * Created by xiao on 2017/5/8.
 */
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

//前台页面
import Home from '../../page/front/default/Home';
import Blog from '../../page/front/default/Blog';
import ArticleDetail from '../../page/front/default/ArticleDetail';
import Error from '../../page/front/default/Error';
import NotFound from '../../component/common/Status/NotFound';
import MessageJump from '../../page/front/default/MessageJump';
import MusicWedgit from '../../component/front/default/common/Music';

//后台页面
import Admin from '../../page/back/default/Admin';
import Login from '../../page/back/default/Login';

const RoutePlus = withRouter(
    class extends React.Component {
        componentDidMount(){
            this.props.history.replace(this.props.location.pathname, {title: document.title});
        }
        render(){
            const { component, ...other } = this.props;
            return <Route {...other} component={component} />
        }
    }
);


const Routes = (isError = false, is404 = false) => {
    return isError ? <Switch><RoutePlus component={Error} /></Switch> :
        (is404 ? <Switch><RoutePlus component={NotFound} /></Switch> :
        <Switch>
            <Route exact path="/*">
                <div className="container">
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/blog" component={Blog} />
                        <Route exact path="/blog/ad([0-9]+)" component={ArticleDetail} />
                    </Switch>
                    <MusicWedgit/>
                </div>
            </Route>
            <Route exact path="/login" component={Login} />
            <Route exact path="/admin*" component={Admin} />
            <Route exact path="/login/*" component={MessageJump} />
            <RoutePlus component={NotFound} />
        </Switch>)
};

export default Routes;