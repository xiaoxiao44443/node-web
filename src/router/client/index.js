/**
 * Created by xiao on 2017/5/8.
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
// import Home from '../../page/front/Home';
import Home from '../../page/front/new/Home';

import Blog from '../../page/front/new/Blog';
import Error from '../../page/front/new/Error';
import NotFound from '../../component/common/Status/NotFound';

const Routes = (isError = false) => {
    return isError ? <Switch><Route component={Error} /></Switch> :
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/Blog" component={Blog} />
            {/*<Route path="/article/ad*" component={Article} />*/}
            <Route component={NotFound} />
        </Switch>
};

export default Routes;