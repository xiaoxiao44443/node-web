/**
 * Created by xiao on 2017/5/5.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { configStore } from './store';
import { StaticRouter } from 'react-router-dom';
import routes from '../router/client';

const serverRender = (url, store = {}) => {
    configStore(store);
    const context = {};
    const app = renderToString(
        <StaticRouter location={url} context={context}>
            {routes('error' in store)}
        </StaticRouter>
    );
    return { app, context }
};

export default serverRender;