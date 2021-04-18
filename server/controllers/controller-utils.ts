import { RequestHandler, ErrorRequestHandler } from 'express'

export function asyncCatcher (callback: RequestHandler): RequestHandler {
    return (req, res, next) => {
      callback(req, res, next)
        .catch(next)
    }
  }

const moveErrorFromSignatureToRequest: ErrorRequestHandler = (err, req, res, next) => {
  req.err = err;
  next();
}

export { moveErrorFromSignatureToRequest };