"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const inputValidation_middleware_1 = __importDefault(require("../../middleware/inputValidation.middleware"));
const auth_1 = require("../../controllers/auth");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.body)('email', 'email is not valid').notEmpty().isEmail().isString(),
    (0, express_validator_1.body)('password', 'password is empty').notEmpty().isString()
], inputValidation_middleware_1.default, auth_1.authControllers.loginController);
router.post('/signup', [
    (0, express_validator_1.body)('email', 'email is not valid').notEmpty().isEmail().isString(),
    (0, express_validator_1.body)('name', 'username is empty').notEmpty().isString(),
    (0, express_validator_1.body)('password', 'password is not empty').notEmpty().isString(),
    (0, express_validator_1.body)('passwordConfirmation', 'password confirmation is empty')
        .notEmpty()
        .isString()
], inputValidation_middleware_1.default, auth_1.authControllers.signupController);
router.get('/checkAuth', auth_1.authControllers.checkAuthController);
router.post('/forgot-password', [(0, express_validator_1.body)('email', 'email is not valid').notEmpty().isEmail().isString()], inputValidation_middleware_1.default, auth_1.authControllers.forgotPasswordController);
router.post('/reset-password', [
    (0, express_validator_1.body)('email', 'email is not valid').notEmpty().isEmail().isString(),
    (0, express_validator_1.body)('token', 'token is not valid').notEmpty().isString(),
    (0, express_validator_1.body)('password', 'password is not valid').notEmpty().isString(),
    (0, express_validator_1.body)('passwordConfirmation', 'password confirmation is not valid').notEmpty().isString(),
], inputValidation_middleware_1.default, auth_1.authControllers.resetPasswordController);
exports.default = router;
