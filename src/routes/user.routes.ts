import { Router } from 'express';
import userController from '../controller/user.controller';
import Authentication from '../middleware/auth.middleware';


const {signin, joinQueue} = userController
const {authenticate} = Authentication


const router = Router();
router.post('/login', signin);
router.post('/join-queue/business/:businessId', authenticate, joinQueue)

export default router;