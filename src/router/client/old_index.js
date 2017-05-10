/**
 * Created by xiao on 2017/3/8.
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
// import Home from '../../page/front/Home';
import Home from '../../page/front/new/Home';

import Article from '../../page/front/Article';
import Error from '../../page/front/Error';
import NotFound from '../../component/common/Status/NotFound';

const Routes = (isError = false) => {
    return isError ? <Switch><Route component={Error} /></Switch> :
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/article/ad*" component={Article} />
            <Route component={NotFound} />
        </Switch>
};

export default Routes;