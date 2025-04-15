import { Router } from 'express';
import { databaseControllers } from '../../controllers/database';

const router = Router();

router.get('/wakedb', databaseControllers.wakedb);

//not sure if this route will crash my app
//router.get('/pingdb', databaseControllers.pingdb);

export default router;
