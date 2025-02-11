import ApiError from '../classes/ApiError.class';
import { Request, Response, NextFunction } from 'express';

//to handle any internal 500 errors
const sendDevopsAlert = (erroPayload: any) => {};

//function will be used to deal with errors in the program
const handleError = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const errorPayload = {
    code: statusCode,
    message: err.message || 'Internal Server Error',
    errors: [{ msg: err.message || 'Internal Server Error' }],
    stack: err.stack,
    timeStamp: new Date().toISOString(),
    IP: req.ip,
    url: req.originalUrl
  };

  // if there is an internal error, send this error to the devops team (if there is one)
  if (statusCode === 500) sendDevopsAlert(errorPayload);

  if (process.env.NODE_ENV != 'development') {
    delete errorPayload.stack;
    delete errorPayload.IP;
  }

  return res.status(statusCode).json(errorPayload);
};

const convertError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const convertError =
    err instanceof ApiError ? err : new ApiError(err.status, err.message, []);
  return handleError(convertError, req, res, next);
};

//handling endpoint which do not exist
const endpointNotFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiError(404, 'Not Found', [{ msg: 'Not Found' }]);
  console.log('endpoint hit');
  return handleError(err, req, res, next);
};

export { handleError, endpointNotFound, convertError };
