import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import inputValidation from '../../middleware/inputValidation.middleware';
import { authControllers } from '../../controllers/auth';

const router = Router();

router.post(
  '/login',
  [
    body('email', 'email is not valid').notEmpty().isEmail().isString(),
    body('password', 'password is empty').notEmpty().isString()
  ],
  inputValidation,
  authControllers.loginController
);

router.post(
  '/signup',
  [
    body('email', 'email is not valid').notEmpty().isEmail().isString(),
    body('name', 'username is empty').notEmpty().isString(),
    body('password', 'password is not empty').notEmpty().isString(),
    body('passwordConfirmation', 'password confirmation is empty')
      .notEmpty()
      .isString()
  ],
  inputValidation,
  authControllers.signupController
);

router.get('/checkAuth', authControllers.checkAuthController);

router.post(
  '/forgot-password',
  [body('email', 'email is not valid').notEmpty().isEmail().isString()],
  inputValidation,
  authControllers.forgotPasswordController
);

router.post('/reset-password',
  [
    body('email','email is not valid').notEmpty().isEmail().isString(),
    body('token','token is not valid').notEmpty().isString(),
    body('password','password is not valid').notEmpty().isString(),
    body('passwordConfirmation','password confirmation is not valid').notEmpty().isString(),
  ],
  inputValidation,
  authControllers.resetPasswordController
)

export default router;
