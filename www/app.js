import '../src/tool/ignore';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import tpl from '../src/tool/tpl';
import router from '../src/router/server/index';
import admin from '../src/router/server/admin';
import comment from '../src/router/server/comment';
import user from '../src/router/server/user';
import music from '../src/router/server/music';
import login from '../src/router/server/login';
import serverRender from '../src/tool/server-render';
import { returnErr } from '../src/tool/Request';

let app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const setImageCacheControl = (res, path) => {
    const mime = express.static.mime.lookup(path);
    if(mime && mime.indexOf('image')!==-1){
        res.setHeader('Cache-Control', 'public, max-age=1d');
    }
};

app.use(express.static(path.resolve(__dirname, '../public'), {
    setHeaders: setImageCacheControl
}));

tpl(app);

app.use('/', router);
app.use('/', login);
app.use('/admin', admin);
app.use('/comment', comment);
app.use('/user', user);
app.use('/music', music);


//404页面处理
app.use((req, res, next) => {
    const store = {notFound: true};
    const { app } = serverRender('/404', store);
    res.status(404).render('status', {title: '404 Not Found', app, init: JSON.stringify(store)});
});

//错误处理
app.use((err, req, res, next) => {
    if(process.env.NODE_ENV == 'production'){
        res.status(500).send('Something broke!');
    }else{
        let accept = req.header('accept');
        let REQUEST_JSON = accept ? accept.indexOf('application/json')!==-1 : false;
        if(REQUEST_JSON){
            res.status(500).json(returnErr(err.message));
        }else{
            const store = {error: {message: err.message, stack: err.stack}};
            const { app } = serverRender(req.url, store);
            res.status(500).render('status', {title: 'Error', app: app, init: JSON.stringify(store)});
        }
    }
});

let server = app.listen(3000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});