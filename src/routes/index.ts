import { Router } from 'express';
import authRoutes from './auth/index';
import transactionRoutes from './transactions/index';
import homePageRoutes from './homePage/index';

const router = Router();

router.use('/auth', authRoutes);

router.use('/transactions', transactionRoutes);

router.use('/homepage', homePageRoutes);

export default router;
