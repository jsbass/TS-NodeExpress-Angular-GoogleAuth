import { OAuth2Client } from 'google-auth-library';
import { Router } from 'express';
import { loadSync } from '../config';
import { asyncCatcher, moveErrorFromSignatureToRequest } from './controller-utils';
import Users from '../services/DataAccess/Users';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import Authentication from '../services/Authentication';

const router = Router();
const config = loadSync();

// TODO: add google login
const googleClient = new OAuth2Client(config.googleClientId);

const csrfProtection = csrf();
router.get('/login', csrfProtection, (req, res, next) => {
    const token = req.csrfToken();
    // tslint:disable-next-line: no-console
    console.log('token', token);
    res.render('account/login', { validationToken: token, errors: [], model: { email: '' } });
});

// return location for Google OAuth2.0 login
router.post('/login',
    bodyParser.urlencoded({extended: false}),
    csrfProtection,
    moveErrorFromSignatureToRequest,
    asyncCatcher(async (req, res, next) => {
        // tslint:disable-next-line: no-console
        console.log('body', req.body._csrf);
        // tslint:disable-next-line: no-console
        console.log('session', req.session.csrfSecret);
        // tslint:disable-next-line: no-console
        console.log('err', req.err);
        const errors:string[] = [];
        if(req.err) {
            errors.push(req.err);
            res.render('account/login', { validationToken: req.csrfToken(), errors: errors, model: req.body });
            return;
        }

        // tslint:disable-next-line: no-console
        console.log('no errors. logging in');
        const user = await Users.getUserByEmail(req.body.email);
        if(user && await bcrypt.compare(req.body.password, user.passwordHash)) {
            req.session.user = user;
        } else {
            errors.push('invalid username/password');
        }

        if(errors.length !== 0) {
            res.render('account/login', { validationToken: req.csrfToken(), errors: errors, model: req.body });
        } else {
            res.redirect((req.query.return as string) ?? '/');
        }

        return;
}));

const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
router.get('/signup', csrfProtection, (req, res, next) => {
    const token = req.csrfToken();
    // tslint:disable-next-line: no-console
    console.log('token', token);
    res.render('account/signup', { validationToken: token, errors: [], model: { name: '', email: '' } });
});

router.get('/logout', (req, res, next) => {
    delete req.session.user;
    res.redirect('/');
});

router.post('/signup',
    bodyParser.urlencoded({extended: false}),
    csrfProtection,
    moveErrorFromSignatureToRequest,
    asyncCatcher(async (req, res, next) => {
        const errors: string[] = [];

        if(req.err) {
            errors.push(req.err);
        }

        // check name
        if(!req.body.name) {
            errors.push('Name cannot be empty');
        }
        // check email
        if(!req.body.email) {
            errors.push('Email cannot be empty');
        } else if (!re.test(req.body.email)) {
            errors.push('Email is not a valid format');
        }

        if(!req.body.password) {
            errors.push('Password cannot be empty');
        }
        // check passwords. todo: add complexity requirements
        if(req.body.password !== req.body.passwordConfirm) {
            errors.push('Passwords must match');
        }

        if(errors.length !== 0) {
            res.render('account/signup', { validationToken: req.csrfToken(), errors: errors, model: req.body });
        }

        try {
            const user = new User();
            user.email = req.body.email;
            user.name = req.body.name;
            user.passwordHash = await bcrypt.hash(req.body.password, 12);

            req.session.user = await Users.addOrUpdateUser(user);
        } catch(e) {
            // tslint:disable-next-line: no-console
            console.debug(e);
            errors.push('Oops. Something went wrong with the signup process');
        }

        if(errors.length !== 0) {
            res.render('account/signup', { validationToken: req.csrfToken(), errors: errors, model: req.body });
        } else {
            res.redirect((req.query.return as string) ?? '/');
        }
    }));
export default router