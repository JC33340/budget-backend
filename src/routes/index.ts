import { Router } from 'express';
import authRoutes from './auth/index';
import transactionRoutes from './transactions/index';

const router = Router();

router.use('/auth', authRoutes);

router.use('/transactions', transactionRoutes);

export default router;
