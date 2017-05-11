/**
 * Created by xiao on 2017/5/8.
 */
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
// import Home from '../../page/front/Home';
import Home from '../../page/front/new/Home';

import Blog from '../../page/front/new/Blog';
import Error from '../../page/front/new/Error';
import NotFound from '../../component/common/Status/NotFound';

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


const Routes = (isError = false) => {
    return isError ? <Switch><RoutePlus component={Error} /></Switch> :
        <Switch>
            <RoutePlus exact path="/" component={Home} />
            <RoutePlus path="/Blog" component={Blog} />
            {/*<Route path="/article/ad*" component={Article} />*/}
            <RoutePlus component={NotFound} />
        </Switch>
};

export default Routes;