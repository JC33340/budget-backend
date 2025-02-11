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

export default router;
