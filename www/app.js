import '../src/tool/ignore';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import tpl from '../src/tool/tpl';
import router from '../src/router/server/index';
import admin from '../src/router/server/admin';
import serverRender from '../src/tool/server-render';
import { returnErr } from '../src/tool/Request';

let app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../public')));
tpl(app);

app.use('/', router);
app.use('/admin', admin);

//404页面处理
app.use((req, res, next) => {
    const store = {};
    const { app } = serverRender(req.url, store);
    res.status(404).render('index', {title: '404 Not Found', app, init: JSON.stringify(store)});
});

//错误处理
app.use((err, req, res, next) => {
    if(process.env.NODE_ENV == 'production'){
        res.status(500).send('Something broke!');
    }else{
        let accept = req.header('accept');
        let REQUEST_JSON = accept.indexOf('application/json')!==-1;
        if(REQUEST_JSON){
            res.status(500).json(returnErr(err));
        }else{
            const store = {error: {message: err.message, stack: err.stack}};
            const { app } = serverRender(req.url, store);
            res.status(500).render('index', {title: 'Error', app: app, init: JSON.stringify(store)});
        }
    }
});

let server = app.listen(3000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});