"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.generateJWT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const generateJWT = (email) => {
    return jsonwebtoken_1.default.sign({ email: email }, `${process.env.JWT_SECRET}`, {
        expiresIn: '2 days'
    });
};
exports.generateJWT = generateJWT;
const validateToken = (token) => {
    let isValid = false;
    const user = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
        if (err) {
            console.log(err);
            isValid = false;
            return {};
        }
        isValid = true;
        return user;
    });
    return { isValid, user };
};
exports.validateToken = validateToken;
