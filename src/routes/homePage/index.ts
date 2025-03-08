import { Router } from 'express';
import { body, header } from 'express-validator';
import inputValidation from '../../middleware/inputValidation.middleware';
import authenticateToken from '../../middleware/authenticateToken.middleware';
import { homepageControllers } from '../../controllers/homepage';

const router = Router();

router.get(
  '/page-info',
  [header('authorization', 'token not present').notEmpty()],
  inputValidation,
  authenticateToken,
  homepageControllers.pageInfo
);

export default router;
