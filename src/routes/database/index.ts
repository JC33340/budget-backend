import { Router } from 'express';
import { databaseControllers } from '../../controllers/database';

const router = Router();

router.get('/wakedb', databaseControllers.wakedb);

router.get('/pingdb', databaseControllers.pingdb);

export default router;
