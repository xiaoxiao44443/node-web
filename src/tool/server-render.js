/**
 * Created by xiao on 2017/5/5.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { configStore } from './store';
import { StaticRouter } from 'react-router-dom';
import routes from '../router/client';
import { Provider } from './store';

const serverRender = (url, store = {}) => {
    configStore(store);
    const context = {};
    const app = renderToString(
        <Provider>
            <StaticRouter location={url} context={context}>
                {routes('error' in store)}
            </StaticRouter>
        </Provider>
    );
    return { app, context }
};

export default serverRender;