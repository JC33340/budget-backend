import { Router } from 'express';
import authRoutes from './auth/index';
import transactionRoutes from './transactions/index';
import homePageRoutes from './homePage/index';
import { wakedb } from '../controllers/database/database.controllers';

const router = Router();

router.use('/auth', authRoutes);

router.use('/transactions', transactionRoutes);

router.use('/homepage', homePageRoutes);

router.get('/wakedb', wakedb);

export default router;
