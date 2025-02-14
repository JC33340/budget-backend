"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.forgotPasswordController = exports.checkAuthController = exports.signupController = exports.loginController = void 0;
const db_config_1 = __importDefault(require("../../config/db.config"));
const auth_utils_1 = require("../../utils/auth.utils");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    //querying database for password using email
    const [row] = (yield db_config_1.default.query('CALL get_user_by_email_address (?)', [
        email
    ]));
    //handling if there are no results
    if (row.length < 1) {
        return res.status(404).json({ message: 'email does not exist' });
    }
    //check password
    const passwordsMatched = yield bcrypt_1.default.compare(password, row[0][0].password);
    if (!passwordsMatched) {
        return res.status(401).json({ message: 'incorrect password' });
    }
    //if no errors
    const jwt = (0, auth_utils_1.generateJWT)(email);
    res.status(200).json({ message: 'login success', jwt: jwt });
});
exports.loginController = loginController;
const signupController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password, passwordConfirmation } = req.body;
    try {
        //password validation
        if (password != passwordConfirmation)
            throw new Error('Passwords do not match');
        //password hashing
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        //sending query
        yield db_config_1.default.query('CALL add_new_user (?,?,?)', [
            email,
            name,
            hashedPassword
        ]);
        //creating jwt
        const jwt = (0, auth_utils_1.generateJWT)(email);
        //response to user
        res.status(201).json({
            message: 'Successfully created user',
            jwt: jwt
        });
    }
    catch (e) {
        console.log(e);
        if (e instanceof Error) {
            if (e.message.includes('Duplicate entry')) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            res.status(400).json({ message: e.message, error: e });
        }
    }
});
exports.signupController = signupController;
const checkAuthController = (req, res, next) => {
    //getting token from request
    let token = req.headers['authorization'];
    //checking if token exists
    if (!token) {
        return res.status(400).json({ message: 'token missing' });
    }
    //manipulating returned information to return only the token
    token = token.split(' ')[1];
    //validating token and getting email address tied to it
    const { isValid, user } = (0, auth_utils_1.validateToken)(token);
    //handling if token is not valid
    if (!isValid) {
        return res.status(403).json({ message: 'token is invalid' });
    }
    res.status(200).json({ message: user });
};
exports.checkAuthController = checkAuthController;
const forgotPasswordController = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        //check that email exists
        const [row] = (yield db_config_1.default.query(`CALL get_user_by_email_address (?)`, [
            email
        ]));
        if (row[0].length < 1) {
            return res.status(404).json({ message: 'email does not exist' });
        }
        const userId = row[0][0].id;
        //generate token
        const buf = crypto_1.default.randomBytes(20).toString('hex');
        //store token into database
        yield db_config_1.default.query(`CALL add_forgot_password_entry (?,?)`, [buf, userId]);
        //send email to user
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email, // Change to your recipient
            from: 'budgeterappexpress@gmail.com', // Change to your verified sender
            subject: 'Reset password link',
            html: `<div><p>Click <a href='${process.env.FRONTEND_URL}/auth/reset-password/${buf}?email=${email}'>here</a> to reset your password</p></div>`
        };
        const response = yield mail_1.default.send(msg);
        if (response[0].statusCode != 202) {
            console.log(response);
            return res.status(500).json({ message: 'Error with sendgrid' });
        }
        //return successful response
        res.status(200).json({ message: `email sent to ${email}` });
    }
    catch (e) {
        if (e instanceof Error) {
            console.log(e.message);
            if (e.message.includes('Duplicate entry')) {
                return res.status(400).json({ message: 'entry already exists' });
            }
            res.status(500).json({ message: e.message });
        }
    }
});
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token, password, passwordConfirmation } = req.body;
        //check passwords match
        if (password != passwordConfirmation) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        //check email exists in reset password db
        const dbToken = yield db_config_1.default.query(`SELECT forgot_password.id, forgot_password.token FROM forgot_password INNER JOIN users ON forgot_password.user_id = users.id WHERE email=? LIMIT 1;`, [email]);
        //converting data into an array
        const tokenArr = dbToken[0];
        //handle is email does not exist in db
        if (tokenArr.length < 1) {
            return res
                .status(404)
                .json({ message: 'Email has not requested a password reset' });
        }
        //check that token matches
        if (tokenArr[0].token != token) {
            return res.status(400).json({ message: 'Token is not valid' });
        }
        //generate new hashed password
        const salt = yield bcrypt_1.default.genSalt();
        const hashedNewPassword = yield bcrypt_1.default.hash(password, salt);
        //change password in db
        yield db_config_1.default.query(`UPDATE users SET password=? WHERE email=?;`, [
            hashedNewPassword,
            email
        ]);
        //delete row for email in forgot password db
        yield db_config_1.default.query(`DELETE FROM forgot_password WHERE id=?`, [tokenArr[0].id]);
        //return
        res.status(200).json({ message: 'connected' });
    }
    catch (e) {
        if (e instanceof Error) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    }
});
exports.resetPasswordController = resetPasswordController;
