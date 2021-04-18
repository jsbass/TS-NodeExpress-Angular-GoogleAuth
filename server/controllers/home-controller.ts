import { RequestHandler, Router } from 'express';
import { loadSync } from '../config';
import auth from '../services/Authentication';

const getIndex: RequestHandler = (req, res) => {
    res.render('index', { request: req });
}

const getOptions: RequestHandler = (req, res) => {
    const config = loadSync();
    res.send(config);
    res.end();
}

const get404: RequestHandler = (req, res) => {
    res.status(404);
    res.render('notFound')
}
const router = Router();

router.get('/options', auth.authorize(['Admin']), getOptions);
router.get('/', getIndex);
router.all('*', get404);

export default router;