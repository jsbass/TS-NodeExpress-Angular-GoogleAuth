import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { loadSync } from '../config';
import { User } from '../models/User';
import { asyncCatcher } from '../controllers/controller-utils';
import { auth } from 'google-auth-library';

const config = loadSync();

export interface AuthorizeOptions {
    loginUrl?: string;
    unauthorizedUrl?: string;
}

const setAuthOptions = (options: AuthorizeOptions): void => {
    Object.assign(authOptions, options);
};

const authOptions: AuthorizeOptions = {
    loginUrl: '/account/login',
    unauthorizedUrl: '/unauthorized'
};

const authorize = (roles: string[]): RequestHandler => {
    return asyncCatcher(async (req, res, next) => {
        if(req.session.user) {
            // tslint:disable-next-line: no-console
                // tslint:disable-next-line: no-console
                console.debug('requires', roles);
                // tslint:disable-next-line: no-console
                console.debug('found', req.session.user.roles);
            if(req.session.user.roles && req.session.user.roles.some((r: string) => roles.some(r2 => r === r2))) {
                next();
            } else {
                res.redirect(authOptions.unauthorizedUrl);
                return;
            }
        } else {
            res.redirect(authOptions.loginUrl);
            return;
        }
    });
}

export default {
    authorize,
    setAuthOptions
}