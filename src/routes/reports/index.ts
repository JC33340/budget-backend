import { Router } from 'express';
import { header } from 'express-validator';
import inputValidation from '../../middleware/inputValidation.middleware';
import authenticateToken from '../../middleware/authenticateToken.middleware';
import { reportsControllers } from '../../controllers/reports';

const router = Router();

router.get(
  '/page-info',
  [header('authorization', 'token not present').notEmpty()],
  inputValidation,
  authenticateToken,
  reportsControllers.pageInfo
);

export default router;
