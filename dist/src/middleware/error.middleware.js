"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertError = exports.endpointNotFound = exports.handleError = void 0;
const ApiError_class_1 = __importDefault(require("../classes/ApiError.class"));
//to handle any internal 500 errors
const sendDevopsAlert = (erroPayload) => { };
//function will be used to deal with errors in the program
const handleError = (err, req, res, next) => {
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
    if (statusCode === 500)
        sendDevopsAlert(errorPayload);
    if (process.env.NODE_ENV != 'development') {
        delete errorPayload.stack;
        delete errorPayload.IP;
    }
    return res.status(statusCode).json(errorPayload);
};
exports.handleError = handleError;
const convertError = (err, req, res, next) => {
    const convertError = err instanceof ApiError_class_1.default ? err : new ApiError_class_1.default(err.status, err.message, []);
    return handleError(convertError, req, res, next);
};
exports.convertError = convertError;
//handling endpoint which do not exist
const endpointNotFound = (req, res, next) => {
    const err = new ApiError_class_1.default(404, 'Not Found', [{ msg: 'Not Found' }]);
    console.log('endpoint hit');
    return handleError(err, req, res, next);
};
exports.endpointNotFound = endpointNotFound;
