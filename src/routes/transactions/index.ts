import { Router, Request, Response, NextFunction } from 'express';
import { body, header } from 'express-validator';
import { transactionControllers } from '../../controllers/transactions';
import inputValidation from '../../middleware/inputValidation.middleware';
import authenticateToken from '../../middleware/authenticateToken.middleware';

const router = Router();

router.get(
  '/page-info',
  [header('authorization', 'token is not present').notEmpty()],
  inputValidation,
  authenticateToken,
  transactionControllers.pageInfo
);

router.post(
  '/add-transaction',
  [
    body('value', 'value is empty').notEmpty().isFloat(),
    header('authorization', 'token is not present').notEmpty()
  ],
  inputValidation,
  authenticateToken,
  transactionControllers.addTransaction
);

router.delete(
  '/delete-transaction',
  [
    body('logId', 'value is empty').notEmpty().isInt(),
    header('authorization', 'token is empty').notEmpty()
  ],
  inputValidation,
  authenticateToken,
  transactionControllers.deleteTransaction
);

export default router;
