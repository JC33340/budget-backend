import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import inputValidation from '../../middleware/inputValidation.middleware';
import { authControllers } from '../../controllers/auth';

const router = Router();

router.post(
  '/login',
  [
    body('emailAddress', 'email address is not valid').notEmpty().isEmail(),
    body('password', 'password is empty').notEmpty()
  ],
  inputValidation,
  authControllers.loginController
);

export default router;
