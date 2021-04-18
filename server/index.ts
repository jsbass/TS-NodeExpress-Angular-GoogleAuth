import express from 'express';
import path from 'path';
import { loadSync as loadConfig } from './config';
import homeRouter from './controllers/home-controller'
import accountRouter from './controllers/account-controller';
import cookieSession from 'cookie-session';
import auth from './services/Authentication';
import bodyParser from 'body-parser';

const config = loadConfig();
const app = express();
const port = config.serverPort; // default port to listen
// placeholder if things need to change
auth.setAuthOptions({});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(cookieSession({
    name: 'SESSION-COOKIE',
    secure: false,
    httpOnly: true,
    path: '/',
    keys: config.sessionSecrets
}));
// set locals
app.use((req, res, next) => {
    // used to test sessions
    // req.session.views = ((req.session.views || 0) + 1) % 200;
    // // tslint:disable-next-line: no-console
    // console.debug('views', req.session.views);
    res.locals.user = req.session.user;
    next();
});
app.use('/account', accountRouter);
app.use('/', homeRouter);

// start the Express server
// tslint:disable:no-console
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
    console.log('server config:', config);
} );